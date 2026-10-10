import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const dataSource = readFileSync(new URL('../src/milestone-data.ts', import.meta.url), 'utf8');
const dataOutput = ts.transpileModule(dataSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const data = await import('data:text/javascript;base64,' + Buffer.from(dataOutput).toString('base64'));
const componentSource = readFileSync(new URL('../src/milestone-journey.tsx', import.meta.url), 'utf8');
const componentOutput = ts.transpileModule(componentSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const componentModule = { exports: {} };
new Function('require', 'module', 'exports', componentOutput)((id) => id === './milestone-data' ? data : require(id), componentModule, componentModule.exports);
const { MilestoneBadge, MilestoneJourney } = componentModule.exports;

const milestone = (kind, state = 'complete', date = '2026-10-09', label = kind) => ({ kind, state, date, label, detail: `${label} verified detail.` });
const signed = [milestone('written-offer', 'complete', '2026-10-08', 'Written offer received'), milestone('signed', 'complete', '2026-10-09', 'Offer signed'), milestone('starting', 'pending', undefined, 'Onboarding next')];
delete signed[2].date;
const nda = [milestone('nda', 'complete', '2026-10-09', 'NDA signed'), milestone('contact', 'scheduled', '2026-10-12', 'Recruiter conversation')];
const discussion = [milestone('contact', 'complete', '2026-09-08', 'Contact made'), milestone('offer-discussion', 'scheduled', '2026-10-12', 'Offer discussion scheduled')];

test('absent milestones generate no journey, badge, or assumed recruiting steps', () => {
  assert.deepEqual(data.getMilestoneJourney(), []);
  assert.equal(data.currentMilestone(), undefined);
  assert.equal(renderToStaticMarkup(createElement(MilestoneJourney, { company: 'Example' })), '');
  assert.equal(renderToStaticMarkup(createElement(MilestoneBadge, {})), '');
});

test('journey preserves authored chronology and undated pending steps without inventing dates', () => {
  assert.strictEqual(data.getMilestoneJourney(signed), signed);
  assert.equal(signed.length, 3);
  assert.equal(signed[2].date, undefined);
  assert.equal(data.milestoneDate(signed[2].date), 'Date to confirm');
  assert.equal(data.milestoneDate('invalid'), 'Date to confirm');
  assert.equal(data.milestoneDate('2026-10-09'), 'Oct 9');
  assert.equal(data.milestoneDate('2026-10-10T01:00:00Z'), 'Oct 9');
});

test('pending onboarding cannot replace an achieved signed offer in the current badge', () => {
  assert.strictEqual(data.currentMilestone(signed), signed[1]);
  assert.equal(data.milestoneSummary(data.currentMilestone(signed)), 'Offer signed');
  const html = renderToStaticMarkup(createElement(MilestoneBadge, { milestones: signed }));
  assert.match(html, /data-kind="signed"/);
  assert.match(html, /Offer signed/);
  assert.doesNotMatch(html, /Started|Start scheduled/);
});

test('scheduled recruiter contact does not hide a completed NDA', () => {
  assert.strictEqual(data.currentMilestone(nda), nda[0]);
  assert.equal(data.milestoneSummary(data.currentMilestone(nda)), 'NDA signed');
});

test('scheduled offer discussion is visible without becoming a written or accepted offer', () => {
  assert.strictEqual(data.currentMilestone(discussion), discussion[1]);
  assert.equal(data.milestoneSummary(discussion[1]), 'Offer discussion scheduled');
  assert.deepEqual(data.getMilestoneJourney(discussion).map((item) => item.kind), ['contact', 'offer-discussion']);
  const html = renderToStaticMarkup(createElement(MilestoneBadge, { milestones: discussion }));
  assert.match(html, /data-state="scheduled"/);
  assert.doesNotMatch(html, /Written offer|Accepted|Signed/);
});

test('only a completed start changes the signed state to started', () => {
  const scheduledStart = [...signed.slice(0, 2), milestone('starting', 'scheduled', '2026-10-26', 'Start scheduled')];
  assert.equal(data.currentMilestone(scheduledStart).kind, 'signed');
  const started = [...signed.slice(0, 2), milestone('starting', 'complete', '2026-10-26', 'First day')];
  assert.equal(data.milestoneSummary(data.currentMilestone(started)), 'Started');
});

test('pending signing preserves the achieved written offer and signed versus accepted wording', () => {
  const waitingForSignature = [signed[0], milestone('signed', 'pending', undefined, 'Signature pending')];
  assert.strictEqual(data.currentMilestone(waitingForSignature), signed[0]);
  assert.equal(data.milestoneSummary(milestone('signed', 'complete', '2026-10-09', 'Offer accepted')), 'Offer accepted');
});

test('replay is opt-in, advances once per tick, and stops at the last verified record', () => {
  assert.deepEqual(data.initialPlayback(3), { index: 2, playing: false });
  let state = data.playbackReducer(data.initialPlayback(3), { type: 'replay', reducedMotion: false });
  assert.deepEqual(state, { index: 0, playing: true });
  state = data.playbackReducer(state, { type: 'tick', count: 3 });
  assert.deepEqual(state, { index: 1, playing: true });
  state = data.playbackReducer(state, { type: 'tick', count: 3 });
  assert.deepEqual(state, { index: 2, playing: false });
  assert.deepEqual(data.playbackReducer(state, { type: 'tick', count: 3 }), state);
});

test('pause and manual navigation stop playback, with bounded previous/next steps', () => {
  const paused = data.playbackReducer({ index: 1, playing: true }, { type: 'pause' });
  assert.deepEqual(data.playbackReducer(paused, { type: 'tick', count: 3 }), paused);
  assert.deepEqual(data.playbackReducer(paused, { type: 'resume', count: 3 }), { index: 1, playing: true });
  assert.deepEqual(data.playbackReducer(paused, { type: 'select', index: -1, count: 3 }), { index: 0, playing: false });
  assert.deepEqual(data.playbackReducer(paused, { type: 'select', index: 9, count: 3 }), { index: 2, playing: false });
});

test('reduced-motion review never starts timed playback', () => {
  assert.deepEqual(data.playbackReducer(data.initialPlayback(3), { type: 'replay', reducedMotion: true }), { index: 0, playing: false });
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(css, /prefers-reduced-motion: reduce[^}]+animation: none !important/);
});

test('default signed view features the achieved commitment and a separate pending next step', () => {
  const html = renderToStaticMarkup(createElement(MilestoneJourney, { company: 'APFM', milestones: signed }));
  assert.match(html, /<h3>Offer signed<\/h3>/);
  assert.match(html, /Latest recorded milestone/);
  assert.match(html, /class="journey-up-next"/);
  assert.match(html, /Onboarding next/);
  assert.match(html, /Pending · Date to confirm/);
  assert.doesNotMatch(html, /Oct 26/);
});

test('NDA detail explicitly separates confidentiality from an employment offer', () => {
  const html = renderToStaticMarkup(createElement(MilestoneJourney, { company: 'Lab37', milestones: nda }));
  assert.match(html, /<h3>NDA signed<\/h3>/);
  assert.match(html, /An NDA covers confidentiality. It does not indicate an employment offer./);
  assert.match(html, /Scheduled · Oct 12/);
});

test('milestone controls expose labels, current step, ordered history and live context', () => {
  const html = renderToStaticMarkup(createElement(MilestoneJourney, { company: 'Amazon', milestones: discussion }));
  assert.match(html, /aria-live="polite" aria-atomic="true"/);
  assert.match(html, /aria-current="step"/);
  assert.match(html, /aria-label="Recorded milestones, oldest to newest"/);
  assert.match(html, /aria-label="Replay journey for Amazon"/);
  assert.match(html, /aria-label="Previous milestone"/);
  assert.match(html, /aria-label="Next milestone"/);
  assert.match(html, /Written offers and employment acceptance are separate milestones./);
});

test('a single verified milestone is presented without unnecessary playback controls', () => {
  const html = renderToStaticMarkup(createElement(MilestoneJourney, { company: 'Example', milestones: [nda[0]] }));
  assert.match(html, /NDA signed/);
  assert.doesNotMatch(html, /journey-controls|journey-track|Replay journey/);
});
