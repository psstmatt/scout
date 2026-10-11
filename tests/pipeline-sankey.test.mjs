import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { posix } from 'node:path';
import { createRequire } from 'node:module';
import { act, createElement, useState } from 'react';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost', pretendToBeVisual: true });
for (const key of ['window', 'document', 'Node', 'NodeFilter', 'Element', 'HTMLElement', 'HTMLInputElement', 'HTMLButtonElement', 'SVGElement', 'MutationObserver', 'CustomEvent', 'Event', 'KeyboardEvent', 'MouseEvent', 'PointerEvent']) {
  Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
}
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import('react-dom/client');
const require = createRequire(import.meta.url);
const read = (file) => readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
function load(file, imports = {}) {
  const output = ts.transpileModule(read(file), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loadedModule = { exports: {} };
  new Function('require', 'module', 'exports', output)((id) => {
    if (imports[id]) return imports[id];
    if (id.startsWith('.')) {
      const path = posix.join(posix.dirname(file), id);
      const extension = ['.ts', '.tsx'].find((ext) => existsSync(new URL(`../src/${path}${ext}`, import.meta.url)));
      return load(`${path}${extension ?? ''}`, imports);
    }
    return require(id);
  }, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const interview = load('interview-data.ts');
const data = load('pipeline-data.ts', { './interview-data': interview });
// React does not server-render portals. Inline only the portal for markup checks;
// the interactive tests below mount the real Radix portal and focus behavior.
const radix = require('radix-ui');
const { PipelineSankey } = load('pipeline-sankey.tsx', {
  './pipeline-data': data,
  'radix-ui': { ...radix, Dialog: { ...radix.Dialog, Portal: ({ children }) => children } },
});
const record = (id, stage, status) => ({ id, company: `Company ${id}`, role: 'Designer', stage, status });
const fixture = [record('a', 'applied', 'applied'), record('b', 'screen', 'waiting'), record('c', 'interview', 'scheduled'), record('d', 'interview', 'waiting'), record('e', 'closed', 'closed')];
const render = (filtered, all = filtered) => renderToStaticMarkup(createElement(PipelineSankey, { filteredOpportunities: filtered, allOpportunities: all, onClose() {}, onSelectOpportunity() {} }));

function assertConserved(graph) {
  assert.equal(graph.nodes.find((node) => node.id === 'total').value, graph.total);
  for (const kind of ['stage', 'status']) {
    const nodes = graph.nodes.filter((node) => node.kind === kind);
    assert.equal(nodes.reduce((sum, node) => sum + node.value, 0), graph.total);
    assert.deepEqual(nodes.flatMap((node) => node.recordIds).sort(), graph.records.map((item) => item.id).sort());
  }
  for (const node of graph.nodes) {
    assert.equal(node.value, new Set(node.recordIds).size);
    const incoming = graph.links.filter((link) => link.target === node.id);
    const outgoing = graph.links.filter((link) => link.source === node.id);
    if (node.kind !== 'total') assert.equal(incoming.reduce((sum, link) => sum + link.value, 0), node.value, `${node.id} incoming`);
    if (node.kind !== 'status') assert.equal(outgoing.reduce((sum, link) => sum + link.value, 0), node.value, `${node.id} outgoing`);
  }
  for (const link of graph.links) {
    assert.equal(link.value, new Set(link.recordIds).size);
    const source = graph.nodes.find((node) => node.id === link.source);
    const target = graph.nodes.find((node) => node.id === link.target);
    assert.ok(link.recordIds.every((id) => source.recordIds.includes(id) && target.recordIds.includes(id)));
  }
}

test('every current opportunity is conserved across total, stages, statuses, and ribbons', () => {
  for (const records of [fixture, interview.opportunities]) {
    const graph = data.buildPipeline(records);
    assert.equal(graph.total, records.length);
    assertConserved(graph);
  }
});

test('duplicate opportunities count once with deterministic first-record authority', () => {
  const graph = data.buildPipeline([...fixture, { ...fixture[0], stage: 'decision', status: 'action' }]);
  assert.equal(graph.total, fixture.length);
  assert.equal(graph.records[0], fixture[0]);
  assert.equal(graph.nodes.some((node) => node.id === 'stage:decision'), false);
  assertConserved(graph);
});

test('missing, unsupported, and prototype-shaped stages and statuses are explicit unknowns', () => {
  const graph = data.buildPipeline([record('a', null, undefined), record('b', 'accepted', 'future-outcome'), record('c', 'toString', '__proto__')]);
  assertConserved(graph);
  assert.equal(graph.nodes.find((node) => node.id === 'stage:unknown').value, 3);
  assert.equal(graph.nodes.find((node) => node.id === 'status:unknown').value, 3);
  assert.equal(data.pipelineStageLabel('closed'), 'Closed / previous stage unspecified');
  assert.equal(data.pipelineStageLabel('accepted'), 'Stage unknown');
  assert.equal(data.pipelineStatusLabel('future-outcome'), 'Status unknown');
});

test('diagram is a snapshot and never fabricates historical stages or employment outcomes', () => {
  const graph = data.buildPipeline([record('a', 'closed', 'closed'), { ...record('b', 'decision', 'action'), milestones: [{ kind: 'signed', state: 'complete' }] }]);
  assert.deepEqual(graph.links.map((link) => [link.source, link.target]), [['total', 'stage:decision'], ['total', 'stage:closed'], ['stage:decision', 'status:action'], ['stage:closed', 'status:closed']]);
  assert.doesNotMatch(JSON.stringify(graph.nodes), /rejected before|accepted|signed|onboarding/i);
  assert.equal(graph.nodes.find((node) => node.id === 'stage:closed').label, 'Closed / previous stage unspecified');
});

test('node and link drilldowns return exactly their matching unique records', () => {
  const graph = data.buildPipeline(fixture);
  assert.deepEqual(data.pipelineMatches(graph, 'stage:interview').map((item) => item.id), ['c', 'd']);
  assert.deepEqual(data.pipelineMatches(graph, 'status:waiting').map((item) => item.id), ['b', 'd']);
  assert.deepEqual(data.pipelineMatches(graph, 'stage:interview>status:waiting').map((item) => item.id), ['d']);
  assert.deepEqual(data.pipelineMatches(graph, 'total>stage:closed').map((item) => item.id), ['e']);
  assert.deepEqual(data.pipelineMatches(graph, 'invalid-selection'), []);
  assert.deepEqual(data.pipelineMatches(graph), fixture);
});

test('filtered scope cannot leak records or counts from the full dataset', () => {
  const filtered = fixture.filter((item) => item.status === 'waiting');
  const graph = data.buildPipeline(filtered);
  assertConserved(graph);
  assert.equal(graph.total, 2);
  assert.deepEqual(data.pipelineMatches(graph, 'status:waiting').map((item) => item.id), ['b', 'd']);
  const html = render(filtered, fixture);
  assert.match(html, /Showing 2 of 5/);
  assert.match(html, /All conversations/);
  assert.match(html, /Diagram scope/);
  assert.match(html, /Open Company b, Designer/);
  assert.doesNotMatch(html, /Open Company a, Designer|Open Company c, Designer|Open Company e, Designer/);
});

test('empty scoped results and an empty entire dataset never create invalid paths or counts', () => {
  const graph = data.buildPipeline([]);
  assert.equal(graph.total, 0);
  assert.deepEqual(graph.links, []);
  assert.deepEqual(data.pipelineMatches(graph), []);
  const layout = data.layoutPipeline(graph);
  assert.ok(Number.isFinite(layout.height));
  assert.equal(layout.scale, 0);
  for (const all of [[], fixture]) {
    const html = render([], all);
    assert.match(html, /No conversations in this view/);
    assert.match(html, new RegExp(`Showing 0 of ${all.length}`));
    assert.doesNotMatch(html, /NaN|Infinity|class="pipeline-link"/);
  }
});

test('every ribbon and node shares one exact count scale with nonoverlapping label slots', () => {
  for (const input of [fixture, interview.opportunities, [fixture[0]]]) {
    const graph = data.buildPipeline(input);
    const layout = data.layoutPipeline(graph);
    for (const node of layout.nodes) assert.equal(node.height, node.value * layout.scale);
    for (const link of layout.links) {
      assert.equal(link.thickness, link.value * layout.scale);
      assert.doesNotMatch(link.path, /NaN|Infinity/);
    }
    for (const kind of ['stage', 'status']) {
      const nodes = layout.nodes.filter((node) => node.kind === kind);
      for (let i = 1; i < nodes.length; i++) {
        assert.ok(nodes[i].y >= nodes[i - 1].y + nodes[i - 1].height);
        assert.ok(nodes[i].y + nodes[i].height / 2 - (nodes[i - 1].y + nodes[i - 1].height / 2) >= 46);
      }
    }
  }
});

test('modal, interactive diagram, tooltips, scope controls, and list alternative are accessible', () => {
  const html = render(fixture);
  assert.match(html, /role="dialog"/);
  assert.match(html, /data-slot="dialog-title"/);
  assert.match(html, /data-slot="dialog-description"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /not historical transitions/);
  assert.match(html, /aria-label="Close pipeline overview"/);
  assert.match(html, /role="tablist"[^>]+aria-label="Pipeline display"/);
  assert.match(html, /role="tab"[^>]+aria-selected="true"/);
  assert.match(html, /role="tabpanel"/);
  assert.match(html, /> List<\/button>/);
  assert.match(html, /aria-live="polite" aria-atomic="true"/);
  assert.match(html, /role="button" tabindex="0"/);
  assert.match(html, /aria-controls="[^"]+"/);
  assert.match(html, /<title>Conversations → Current recorded stage → Current status<\/title>/);
  assert.match(html, /previous stage unspecified/);
  const component = read('pipeline-sankey.tsx');
  assert.match(component, /<Dialog open onOpenChange=/);
  assert.match(component, /onOpenAutoFocus=/);
  assert.match(component, /onCloseAutoFocus=\{\(event\) => event\.preventDefault\(\)\}/);
  assert.match(component, /onEscapeKeyDown=\{\(event\) => \{ event\.preventDefault\(\); event\.stopPropagation\(\); onClose\(\); \}\}/);
  assert.match(component, /onInteractOutside=\{\(event\) => event\.preventDefault\(\)\}/);
  assert.match(component, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(component, /onClick=\{\(\) => onSelectOpportunity\(record\.id\)\}/);
});

test('existing total button opens the filtered diagram without closing the background inspector on Escape', () => {
  const page = read('page.tsx');
  assert.match(page, /<(?:button|Button)[^>]+className="result-count"/);
  assert.match(page, /aria-haspopup="dialog"/);
  assert.match(page, /filteredOpportunities=\{filtered\}/);
  assert.match(page, /allOpportunities=\{opportunities\}/);
  assert.match(page, /if \(!selectedId \|\| sankeyOpen\) return/);
});


test('hover traces scoped records while narrow flows retain a generous hit target', () => {
  const component = read('pipeline-sankey.tsx');
  assert.match(component, /new Set\(preview\.recordIds\)/);
  assert.match(component, /Math\.max\(12, link\.thickness\)/);
  const layout = data.layoutPipeline(data.buildPipeline(fixture));
  for (const link of layout.links) assert.match(link.centerPath, /^M .+ C /);
});


test('real shadcn modal traps focus, supports keyboard tabs, preserves scope, and returns focus through caller callbacks', async () => {
  const { PipelineSankey: LivePipeline } = load('pipeline-sankey.tsx', { './pipeline-data': data });
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  let selected = null;
  let closeCount = 0;
  let backgroundEscapes = 0;
  const backgroundKey = (event) => { if (event.key === 'Escape' && !event.defaultPrevented) backgroundEscapes++; };
  window.addEventListener('keydown', backgroundKey);
  function Harness() {
    const [open, setOpen] = useState(true);
    return createElement('div', null,
      createElement('button', { id: 'pipeline-opener', onClick: () => setOpen(true) }, 'Open pipeline'),
      createElement('div', { id: 'background-inspector', tabIndex: -1 }, 'Existing inspector'),
      open && createElement(LivePipeline, {
        filteredOpportunities: fixture.filter((item) => item.status === 'waiting'),
        allOpportunities: fixture,
        onClose() { closeCount++; setOpen(false); requestAnimationFrame(() => document.getElementById('pipeline-opener').focus()); },
        onSelectOpportunity(id) { selected = id; setOpen(false); requestAnimationFrame(() => document.getElementById('background-inspector').focus()); },
      }),
    );
  }
  const settle = async (action) => { await act(async () => { action?.(); await new Promise((resolve) => setTimeout(resolve, 35)); }); };
  const click = (element) => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  const press = (element, key, shiftKey = false) => element.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }));
  const recordButtons = () => [...document.querySelectorAll('.pipeline-record')];
  try {
    await settle(() => root.render(createElement(Harness)));
    const modal = document.querySelector('[role="dialog"]');
    assert.ok(modal);
    assert.equal(document.activeElement.getAttribute('aria-label'), 'Close pipeline overview');
    assert.equal(document.getElementById(modal.getAttribute('aria-labelledby')).textContent, 'The shape of your search.');
    assert.match(document.getElementById(modal.getAttribute('aria-describedby')).textContent, /not historical transitions/);
    assert.equal(document.getElementById('pipeline-opener').closest('[aria-hidden="true"]') !== null, true);
    assert.deepEqual(recordButtons().map((el) => el.getAttribute('aria-label')), ['Open Company b, Designer', 'Open Company d, Designer']);
    await settle(() => document.getElementById('pipeline-opener').focus());
    assert.ok(modal.contains(document.activeElement), 'programmatic outside focus is trapped');
    await settle(() => { recordButtons().at(-1).focus(); press(document.activeElement, 'Tab'); });
    assert.equal(document.activeElement.getAttribute('aria-label'), 'Close pipeline overview');
    await settle(() => press(document.activeElement, 'Tab', true));
    assert.equal(document.activeElement, recordButtons().at(-1));
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    await settle(() => { tabs[0].focus(); press(tabs[0], 'ArrowRight'); });
    assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
    assert.equal(document.querySelector('.pipeline-list-view') !== null, true);
    const stageChoice = [...document.querySelectorAll('.pipeline-list-choice')].find((el) => el.textContent.startsWith('Interview'));
    await settle(() => click(stageChoice));
    assert.deepEqual(recordButtons().map((el) => el.getAttribute('aria-label')), ['Open Company d, Designer']);
    const scopes = [...document.querySelectorAll('[aria-label="Diagram scope"] button')];
    await settle(() => click(scopes[1]));
    assert.equal(recordButtons().length, fixture.length);
    assert.equal(tabs[1].getAttribute('aria-selected'), 'true', 'scope changes preserve List view');
    await settle(() => click(scopes[0]));
    assert.equal(recordButtons().length, 2);
    await settle(() => scopes[1].focus());
    assert.ok(document.querySelector('[role="tooltip"]'), 'real Radix tooltip appears on keyboard focus');
    await settle(() => press(scopes[1], 'Escape'));
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.equal(closeCount, 1);
    assert.equal(backgroundEscapes, 0, 'Escape does not reach the existing inspector');
    assert.equal(document.activeElement.id, 'pipeline-opener');
    assert.equal(document.getElementById('pipeline-opener').closest('[aria-hidden="true"]'), null);
    await settle(() => click(document.getElementById('pipeline-opener')));
    assert.equal(recordButtons().length, 2, 'reopening returns to filtered scope');
    await settle(() => click(recordButtons()[0]));
    assert.equal(selected, 'b');
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.equal(document.activeElement.id, 'background-inspector');
    await settle(() => click(document.getElementById('pipeline-opener')));
    await settle(() => click(document.querySelector('.pipeline-close')));
    assert.equal(closeCount, 2);
    assert.equal(document.activeElement.id, 'pipeline-opener');
  } finally {
    await settle(() => root.unmount());
    host.remove();
    window.removeEventListener('keydown', backgroundKey);
  }
});
