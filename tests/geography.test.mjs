import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const read = (file) => readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
function load(file, imports = {}) {
  const output = ts.transpileModule(read(file), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loadedModule = { exports: {} };
  new Function('require', 'module', 'exports', output)((id) => imports[id] ?? require(id), loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const geography = load('geography-data.ts');
const interview = load('interview-data.ts');
const utils = load('lib/utils.ts');
const button = load('ui/button.tsx', { '../lib/utils': utils });
const globeGeometry = load('globe-geometry.ts');
const globe = load('globe.tsx', { './ui/button': button, './globe-fallback': {}, './globe-geometry': globeGeometry, cobe: {} });
const { RoleGeography } = load('role-geography.tsx', { './geography-data': geography, './globe': globe, './ui/button': button });
const record = (id, company = `Company ${id}`, role = 'Designer') => ({ id, company, role });
const evidence = { label: 'Role description', detail: 'Explicitly documented for this particular role.' };
const seattle = { id: 'seattle', label: 'Seattle', coordinates: [47.61, -122.33] };
const london = { id: 'london', label: 'London', coordinates: [51.51, -.13] };
const fixtures = [record('a'), record('b'), record('c'), record('d'), record('e')];
const locations = {
  a: { kind: 'located', location: seattle, evidence },
  b: { kind: 'located', location: seattle, evidence },
  c: { kind: 'located', location: london, evidence },
  d: { kind: 'remote', region: 'United States', evidence },
};
const render = (input, selectedOpportunityId, locationEvidence = locations) => renderToStaticMarkup(createElement(RoleGeography, { filteredOpportunities: input, selectedOpportunityId, locationEvidence, onSelectOpportunity() {} }));

function assertConserved(snapshot) {
  assert.equal(snapshot.total, snapshot.records.length);
  assert.equal(Object.values(snapshot.counts).reduce((sum, value) => sum + value, 0), snapshot.total);
  assert.equal(snapshot.entries.length, snapshot.total);
  assert.deepEqual(snapshot.groups.flatMap((group) => group.recordIds).sort(), snapshot.records.map((item) => item.id).sort());
  for (const group of snapshot.groups) {
    assert.equal(new Set(group.recordIds).size, group.recordIds.length);
    assert.deepEqual(geography.geographyMatches(snapshot, group.id).map((entry) => entry.record.id), group.recordIds);
    assert.ok(group.recordIds.every((id) => snapshot.entries.some((entry) => entry.record.id === id && entry.geography.kind === group.kind)));
  }
  const preset = geography.geographyPreset(snapshot);
  assert.equal(preset.markers.reduce((sum, marker) => sum + marker.count, 0), snapshot.counts.located);
  assert.equal(preset.arcs.length, 0, 'No inferred commutes or travel routes');
}

test('every unique opportunity is partitioned once into documented city, remote, or unknown', () => {
  const snapshot = geography.buildGeography(fixtures, locations);
  assertConserved(snapshot);
  assert.deepEqual(snapshot.counts, { located: 3, remote: 1, unknown: 1 });
  assert.equal(snapshot.groups.find((group) => group.label === 'Seattle').recordIds.length, 2);
  assert.equal(geography.geographyPreset(snapshot).markers.length, 2);
  assertConserved(geography.buildGeography(interview.opportunities));
  for (const status of new Set(interview.opportunities.map((item) => item.status))) {
    const filtered = interview.opportunities.filter((item) => item.status === status);
    const scoped = geography.buildGeography(filtered);
    assertConserved(scoped);
    assert.equal(scoped.total, filtered.length);
  }
});

test('duplicates count once with the first record authoritative, matching Sankey and selection', () => {
  const snapshot = geography.buildGeography([...fixtures, { ...fixtures[0], company: 'Duplicate' }], locations);
  assertConserved(snapshot);
  assert.equal(snapshot.total, 5);
  assert.strictEqual(snapshot.records[0], fixtures[0]);
});

test('filters cannot leak records, counts, or selected pins from the full dataset', () => {
  const subset = fixtures.filter((item) => ['d', 'e'].includes(item.id));
  const snapshot = geography.buildGeography(subset, locations);
  assertConserved(snapshot);
  const preset = geography.geographyPreset(snapshot, 'a');
  assert.equal(preset.markers.length, 0);
  assert.deepEqual(snapshot.counts, { located: 0, remote: 1, unknown: 1 });
  const html = render(subset, 'a');
  assert.match(html, /2 shown/);
  assert.match(html, /selected conversation is outside these filters/);
  assert.doesNotMatch(html, /Open Company a|Open Company b|Open Company c|>Seattle</);
});

test('missing, uncertain, malformed, and prototype-shaped data remain unknown', () => {
  const broken = {
    a: { kind: 'located', location: { ...seattle, coordinates: [NaN, -122] }, evidence },
    b: { kind: 'located', location: { ...seattle, coordinates: [95, -122] }, evidence },
    c: { kind: 'remote' },
    d: { kind: 'headquarters', location: seattle, evidence },
    e: { kind: 'located', location: seattle, evidence: { label: '', detail: '' } },
    f: { kind: 'located', location: { ...seattle, coordinates: [47, 200] }, evidence },
  };
  const snapshot = geography.buildGeography([...fixtures, record('f'), record('toString'), record('__proto__')], broken);
  assertConserved(snapshot);
  assert.deepEqual(snapshot.counts, { located: 0, remote: 0, unknown: 8 });
});

test('a city in company name, recruiter location, timezone, or tag never creates a role pin', () => {
  const data = [{ ...record('example', 'City of Seattle'), tags: ['remote', 'Seattle'], recruiterLocation: 'Seattle', timeZone: 'America/Los_Angeles' }];
  const snapshot = geography.buildGeography(data, {});
  assert.deepEqual(snapshot.counts, { located: 0, remote: 0, unknown: 1 });
  assert.deepEqual(geography.geographyPreset(snapshot).markers, []);
});

test('a selected documented role and a focused location both centre the correct coordinates', () => {
  const snapshot = geography.buildGeography(fixtures, locations);
  const selected = geography.geographyPreset(snapshot, 'c');
  assert.deepEqual([selected.latitude, selected.longitude], london.coordinates);
  const seattleGroup = snapshot.groups.find((group) => group.label === 'Seattle');
  const focused = geography.geographyPreset(snapshot, 'c', seattleGroup.id);
  assert.deepEqual([focused.latitude, focused.longitude], seattle.coordinates);
  assert.equal(focused.markers.find((marker) => marker.label === 'Seattle').color, '#efa6c2');
  assert.equal(focused.markers.find((marker) => marker.label === 'London').color, '#92988b');
  assert.deepEqual(globe.focusAngles(focused), globeGeometry.focusLocation(...seattle.coordinates));
});

test('remote and unknown selections do not manufacture pins and keep uncertainty visible', () => {
  for (const id of ['d', 'e']) {
    const html = render(fixtures, id);
    assert.match(html, /The pins show other documented roles in this filtered view/);
    assert.match(html, /Remote and unknown stay unpinned/);
    assert.match(html, /Company offices and interview venues aren’t role locations/);
  }
  assert.match(render(fixtures, 'd'), /Remote · United States/);
  assert.match(render(fixtures, 'e'), /No role-specific location has been recorded/);
});

test('empty and all-unlocated scopes remain finite and have no geographic markers', () => {
  for (const input of [[], fixtures]) {
    const snapshot = geography.buildGeography(input, {});
    assertConserved(snapshot);
    const preset = geography.geographyPreset(snapshot);
    assert.ok(Number.isFinite(preset.latitude) && Number.isFinite(preset.longitude));
    assert.deepEqual(preset.markers, []);
  }
  const html = render([]);
  assert.match(html, /0 shown/);
  assert.match(html, /No conversations match these filters. No locations are plotted/);
  assert.doesNotMatch(html, /NaN|Infinity/);
});

test('worldwide overview uses a spherical mean rather than the wrong side of the date line', () => {
  const map = { a: { kind: 'located', location: { id: 'east', label: 'East', coordinates: [20, 179] }, evidence }, b: { kind: 'located', location: { id: 'west', label: 'West', coordinates: [20, -179] }, evidence } };
  const preset = geography.geographyPreset(geography.buildGeography(fixtures.slice(0, 2), map));
  assert.ok(Math.abs(preset.longitude) > 170);
});

test('same-named inconsistent coordinates cannot silently merge into one marker', () => {
  const map = { ...locations, b: { kind: 'located', location: { ...seattle, coordinates: [48, -123] }, evidence } };
  const snapshot = geography.buildGeography(fixtures, map);
  assert.equal(snapshot.groups.filter((group) => group.kind === 'located').length, 3);
  assertConserved(snapshot);
});

test('location list offers accessible role selection, named counts, and keyboard globe controls', () => {
  const html = render(fixtures, 'a');
  assert.match(html, /aria-label="Geography groups"/);
  assert.match(html, /aria-label="Focus a documented role location"/);
  assert.match(html, /aria-live="polite" aria-atomic="true"/);
  assert.match(html, /aria-label="Open Company a, Designer"/);
  assert.match(html, /aria-label="Open Company b, Designer"/);
  assert.doesNotMatch(html, /aria-label="Open Company c, Designer"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /data-slot="button"/);
  assert.match(html, /Home recenters/);
  assert.match(html, /aria-label="Recenter globe"/);
  assert.match(read('role-geography.tsx'), /onClick=\{\(\) => onSelectOpportunity\(record.id\)\}/);
});

test('globe preserves drag, reduced motion, recentering and a fresh-canvas failure fallback', () => {
  const source = read('globe.tsx');
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /reducedMotion.matches \? 1 : .1/);
  assert.match(source, /onPointerCancel/);
  assert.match(source, /onLostPointerCapture/);
  assert.match(source, /key=\{renderer\}/);
  assert.match(source, /setRenderer\("canvas"\)/);
  assert.match(source, /cancelAnimationFrame\(frame\)/);
  assert.match(source, /globe.destroy\(\)/);
  assert.doesNotMatch(source, /companyFootprint|Company footprint|northAmerica|routes\(/);
});

test('published evidence uses safe summaries and only belongs to known opportunity IDs', () => {
  const ids = new Set(interview.opportunities.map((item) => item.id));
  for (const [id, value] of Object.entries(geography.roleGeographyEvidence)) {
    assert.ok(ids.has(id), `Orphan geography entry: ${id}`);
    assert.notEqual(geography.roleGeographyFor(id), undefined);
    if (value.kind !== 'unknown') assert.ok(value.evidence.label && value.evidence.detail);
  }
  assert.doesNotMatch(JSON.stringify(geography.roleGeographyEvidence), /mail\.google\.com|calendar\.google\.com|granola\.ai|meet\.google|zoom\.us|mailto:|passcode/i);
});

// COBE v2 intentionally leaves its canvas wrapper in place when destroy() runs.
// These mounted React tests reproduce that exact DOM mutation rather than using
// a renderer mock that keeps the canvas where React originally placed it.
async function mountGlobeWithCobeWrapper({ strict = false, failInitialization = false } = {}) {
  const { JSDOM } = await import('jsdom');
  const { act, StrictMode } = await import('react');
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { pretendToBeVisual: true });
  const frames = new Map();
  let frameId = 0;
  const replacements = {
    window: dom.window, document: dom.window.document,
    HTMLElement: dom.window.HTMLElement, HTMLCanvasElement: dom.window.HTMLCanvasElement,
    IS_REACT_ACT_ENVIRONMENT: true,
    ResizeObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => { frames.delete(id); },
  };
  const originals = new Map(Object.keys(replacements).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(replacements)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({});
  const calls = { cobe: 0, cobeDestroyed: 0, fallback: 0, fallbackDestroyed: 0, fallbackUpdates: [] };
  const errors = [];
  const fakeCobe = (canvas) => {
    calls.cobe += 1;
    const wrapper = canvas.ownerDocument.createElement('div');
    wrapper.dataset.cobeWrapper = 'true';
    wrapper.style.cssText = 'position:relative;width:100%;height:100%';
    canvas.parentElement.insertBefore(wrapper, canvas);
    wrapper.append(canvas);
    if (failInitialization) throw new Error('WebGL initialization failed after reparenting');
    return { update() {}, destroy() { calls.cobeDestroyed += 1; } };
  };
  const { Globe: MountedGlobe } = load('globe.tsx', {
    './ui/button': button,
    './globe-geometry': globeGeometry,
    cobe: { __esModule: true, default: fakeCobe },
    './globe-fallback': { createCanvasGlobe() { calls.fallback += 1; return { update(value) { calls.fallbackUpdates.push(value); }, destroy() { calls.fallbackDestroyed += 1; } }; } },
  });
  const { createRoot } = await import('react-dom/client');
  const root = createRoot(dom.window.document.querySelector('#root'), { onUncaughtError(error) { errors.push(error); } });
  const snapshot = geography.buildGeography(fixtures, locations);
  const draw = (selectedId) => {
    const tree = createElement(MountedGlobe, { preset: geography.geographyPreset(snapshot, selectedId) });
    root.render(strict ? createElement(StrictMode, null, tree) : tree);
  };
  const cleanup = async () => {
    await act(async () => root.unmount());
    for (const [key, original] of originals) {
      if (original) Object.defineProperty(globalThis, key, original);
      else delete globalThis[key];
    }
    dom.window.close();
  };
  await act(async () => draw('a'));
  return { dom, act, draw, calls, errors, frames, cleanup };
}

test('a COBE-reparented canvas safely switches to a fresh 2D canvas after context loss', async () => {
  const mounted = await mountGlobeWithCobeWrapper();
  const { dom, act, calls, errors, frames } = mounted;
  try {
    const originalCanvas = dom.window.document.querySelector('canvas');
    const originalHost = dom.window.document.querySelector('.globe-canvas-host');
    assert.equal(originalCanvas.parentElement.dataset.cobeWrapper, 'true');
    await act(async () => originalCanvas.dispatchEvent(new dom.window.Event('webglcontextlost', { cancelable: true })));
    assert.deepEqual(errors, [], 'React must remove its host, not a canvas COBE moved');
    const fallbackCanvas = dom.window.document.querySelector('canvas');
    assert.ok(fallbackCanvas?.isConnected);
    assert.notStrictEqual(fallbackCanvas, originalCanvas);
    assert.equal(originalCanvas.isConnected, false);
    assert.strictEqual(originalCanvas.parentElement, originalHost, 'Cleanup restores the detached host too');
    assert.equal(originalHost.querySelectorAll('[data-cobe-wrapper]').length, 0);
    assert.equal(calls.fallback, 1);
    assert.equal(calls.cobeDestroyed, 1);
    await act(async () => originalCanvas.dispatchEvent(new dom.window.Event('webglcontextlost', { cancelable: true })));
    assert.equal(calls.fallback, 1, 'The old canvas no longer owns a context-loss handler');
    await act(async () => mounted.draw('c'));
    assert.ok(calls.fallbackUpdates.some((update) => update.markers?.some((marker) => marker.location[1] === london.coordinates[1])));
  } finally { await mounted.cleanup(); }
  assert.equal(calls.fallbackDestroyed, 1);
  assert.equal(frames.size, 0);
  assert.deepEqual(errors, []);
});

test('StrictMode cleanup restores the React host before COBE initialization repeats', async () => {
  const mounted = await mountGlobeWithCobeWrapper({ strict: true });
  const { dom, act, calls, errors, frames } = mounted;
  try {
    assert.equal(calls.cobe, 2);
    assert.equal(calls.cobeDestroyed, 1);
    assert.equal(dom.window.document.querySelectorAll('[data-cobe-wrapper]').length, 1, 'No leftover or nested wrappers');
    const canvas = dom.window.document.querySelector('canvas');
    const host = dom.window.document.querySelector('.globe-canvas-host');
    assert.strictEqual(canvas.parentElement.parentElement, host);
    await act(async () => canvas.dispatchEvent(new dom.window.Event('webglcontextlost', { cancelable: true })));
    assert.equal(calls.fallback, 1);
    assert.equal(calls.cobeDestroyed, 2);
    assert.equal(dom.window.document.querySelectorAll('[data-cobe-wrapper]').length, 0);
    assert.ok(dom.window.document.querySelector('canvas').isConnected);
    assert.deepEqual(errors, []);
  } finally { await mounted.cleanup(); }
  assert.equal(calls.fallbackDestroyed, 1);
  assert.equal(frames.size, 0);
});

test('initialization failure after COBE reparents the canvas also leaves a clean fallback host', async () => {
  const mounted = await mountGlobeWithCobeWrapper({ strict: true, failInitialization: true });
  const { dom, calls, errors, frames } = mounted;
  try {
    assert.equal(calls.cobe, 2);
    assert.equal(calls.fallback, 1);
    assert.equal(dom.window.document.querySelectorAll('[data-cobe-wrapper]').length, 0);
    assert.strictEqual(dom.window.document.querySelector('canvas').parentElement, dom.window.document.querySelector('.globe-canvas-host'));
    assert.deepEqual(errors, []);
  } finally { await mounted.cleanup(); }
  assert.equal(calls.fallbackDestroyed, 1);
  assert.equal(frames.size, 0);
});
