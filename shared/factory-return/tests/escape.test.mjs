import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listenForCooperativeEscape } from '../dist/escape.js';

// Models capture -> application handler -> window bubble. Native browser tests remain required.
class FakeWindow {
  listeners = new Map();
  addEventListener(type, fn, capture = false) {
    const list = this.listeners.get(type) ?? [];
    list.push({ fn, capture }); this.listeners.set(type, list);
  }
  removeEventListener(type, fn, capture = false) {
    this.listeners.set(type, (this.listeners.get(type) ?? []).filter(x => x.fn !== fn || x.capture !== capture));
  }
  dispatch(event, middle = () => {}) {
    const list = this.listeners.get(event.type) ?? [];
    for (const item of list.filter(x => x.capture)) item.fn(event);
    middle(event);
    if (!event.stopped) for (const item of list.filter(x => !x.capture)) item.fn(event);
  }
}
function element({ control = false, hidden = false, opacity = '1' } = {}) {
  return { nodeType: 1, isConnected: true, parentElement: null,
    closest: selector => selector.startsWith('[hidden]') ? hidden ? {} : null : control ? {} : null,
    getClientRects: () => [{ width: 30, height: 30 }],
    style: { display: 'block', visibility: 'visible', opacity } };
}
function event(overrides = {}) {
  return { type: 'keydown', key: 'Escape', repeat: false, isComposing: false, ctrlKey: false,
    altKey: false, metaKey: false, shiftKey: false, defaultPrevented: false,
    composedPath: () => [], preventDefault() { this.defaultPrevented = true; }, ...overrides };
}
function env() {
  const window = new FakeWindow(); const queue = []; let visit = 'visit:entry1'; let returns = 0;
  const document = { fullscreenElement: null, pointerLockElement: null, activeElement: null, layers: [],
    querySelectorAll(selector) { return selector === ':popover-open' ? [] : this.layers; },
    defaultView: { getComputedStyle: node => node.style } };
  const stop = listenForCooperativeEscape({ window, document, getVisit: () => visit,
    onReturn: () => { returns++; }, enqueue: fn => queue.push(fn) });
  const key = (props = {}, middle) => { const e = event(props); window.dispatch(e, middle); return e; };
  return { window, document, key, stop, queue, get returns() { return returns; },
    setVisit: value => { visit = value; }, flush: () => { queue.splice(0).forEach(fn => fn()); },
    release: () => window.dispatch(event({ type: 'keyup' })),
    show: () => window.dispatch(event({ type: 'pageshow' })) };
}

test('plain Escape returns once and claims the browser default action', () => {
  const e = env(); const key = e.key(); assert.equal(key.defaultPrevented, true);
  e.flush(); assert.equal(e.returns, 1);
  e.release(); e.key(); e.flush(); assert.equal(e.returns, 1, 'latched until restore'); e.stop();
});

test('capture ownership prevents dialog close and return during one event', () => {
  const e = env(); e.document.layers = [element()];
  const key = e.key({}, () => { e.document.layers = []; });
  assert.equal(key.defaultPrevented, false); e.flush(); assert.equal(e.returns, 0);
  e.release(); e.key(); e.flush(); assert.equal(e.returns, 1); e.stop();
});

test('input, media, editable and shadow host ownership remain local', () => {
  const e = env();
  for (const props of [{ composedPath: () => [element({ control: true })] },
    { composedPath: () => [element(), element({ control: true })] }]) {
    assert.equal(e.key(props).defaultPrevented, false); e.release();
  }
  e.document.activeElement = element({ control: true }); e.key(); e.flush();
  assert.equal(e.returns, 0); e.stop();
});

test('fullscreen and pointer-lock Escape remain local, including same-event exit', () => {
  for (const property of ['fullscreenElement', 'pointerLockElement']) {
    const e = env(); e.document[property] = element();
    e.key({}, () => { e.document[property] = null; }); e.flush(); assert.equal(e.returns, 0);
    e.release(); e.key(); e.flush(); assert.equal(e.returns, 1); e.stop();
  }
});

test('hidden/inert/stale layers do not block the next plain Escape', () => {
  const e = env(); e.document.layers = [element({ hidden: true }), element({ opacity: '0' })];
  e.key(); e.flush(); assert.equal(e.returns, 1); e.stop();
});

test('IME, modifiers, repeat and held keydowns never return', () => {
  const e = env();
  for (const props of [{ isComposing: true }, { ctrlKey: true }, { altKey: true },
    { metaKey: true }, { shiftKey: true }, { repeat: true }, { key: 'Enter' }]) {
    assert.equal(e.key(props).defaultPrevented, false); e.release();
  }
  e.key({ isComposing: true }); e.key(); e.flush(); assert.equal(e.returns, 0, 'held after consumed key');
  e.release(); e.key(); e.key(); e.flush(); assert.equal(e.returns, 1); e.stop();
});

test('defaultPrevented and stopped propagation preserve app ownership', () => {
  const e = env(); e.key({}, key => { key.preventDefault(); }); e.release();
  e.key({}, key => { key.stopped = true; }); e.flush(); assert.equal(e.returns, 0); e.stop();
});

test('direct, expired and newer visits invalidate queued returns', () => {
  const e = env(); e.setVisit(null); assert.equal(e.key().defaultPrevented, false); e.release();
  e.setVisit('old'); e.key(); e.setVisit(null); e.flush(); assert.equal(e.returns, 0); e.release();
  e.setVisit('old'); e.key(); e.setVisit('new'); e.flush(); assert.equal(e.returns, 0); e.stop();
});

test('pagehide/disposal cancel pending work; BFCache pageshow restores one usable listener', () => {
  const e = env(); e.key(); e.window.dispatch(event({ type: 'pagehide' })); e.flush();
  assert.equal(e.returns, 0); e.show(); e.key(); e.flush(); assert.equal(e.returns, 1);
  e.show(); e.key(); e.stop(); e.flush(); assert.equal(e.returns, 1);
  assert.ok([...e.window.listeners.values()].every(list => list.length === 0));
});
