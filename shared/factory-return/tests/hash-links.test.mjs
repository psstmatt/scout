import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installFactoryHashLinks } from '../dist/hash-links.js';

globalThis.HashChangeEvent ??= class extends Event {
  constructor(type, init) { super(type); this.oldURL = init.oldURL; this.newURL = init.newURL; }
};

function env() {
  const listeners = new Map(); const emitted = []; let visit = { nonce: 'accepted-visit' };
  const location = { href: 'https://anduril.psstmatt.com/?view=dive#home' };
  const history = { state: { routerKey: 'keep', visit: 'accepted-visit' }, pushes: [],
    pushState(state, unused, href) { this.state = state; this.pushes.push({ state, href }); location.href = href; } };
  const window = { location, history,
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener(type, fn) { if (listeners.get(type) === fn) listeners.delete(type); },
    dispatchEvent(event) { emitted.push(event); return true; } };
  let baseTarget = null;
  const document = { querySelector: () => baseTarget ? { getAttribute: () => baseTarget } : null };
  const bridge = { getVisit: () => visit,
    inheritRoute: state => ({ ...state, travel: 'inherited' }) };
  const stop = installFactoryHashLinks({ window, document, bridge });
  function click(href = 'https://anduril.psstmatt.com/?view=dive#work', props = {}, attrs = {}) {
    const anchor = { nodeType: 1, tagName: 'A', href,
      hasAttribute: key => key === 'href' || key in attrs,
      getAttribute: key => attrs[key] ?? null };
    const event = { isTrusted: true, defaultPrevented: false, button: 0,
      metaKey: false, ctrlKey: false, altKey: false, shiftKey: false,
      composedPath: () => [anchor], preventDefault() { this.defaultPrevented = true; }, ...props };
    listeners.get('click')?.(event); return event;
  }
  return { location, history, window, emitted, click, stop, listeners,
    setVisit: next => { visit = next; }, setBaseTarget: next => { baseTarget = next; } };
}

test('trusted in-visit anchor click preserves history and dispatches the existing app hashchange path', () => {
  const e = env(); const event = e.click();
  assert.equal(event.defaultPrevented, true);
  assert.equal(e.history.pushes.length, 1);
  assert.deepEqual(e.history.state, { routerKey: 'keep', visit: 'accepted-visit', travel: 'inherited' });
  assert.equal(e.location.href, 'https://anduril.psstmatt.com/?view=dive#work');
  assert.equal(e.emitted[0].type, 'hashchange');
  assert.equal(e.emitted[0].oldURL, 'https://anduril.psstmatt.com/?view=dive#home');
  assert.equal(e.emitted[0].newURL, e.location.href);
  e.stop(); assert.equal(e.listeners.size, 0);
});

test('direct, expired, synthetic, modified and consumed clicks remain native', () => {
  const e = env();
  for (const props of [{ isTrusted: false }, { defaultPrevented: true }, { button: 1 },
    { ctrlKey: true }, { metaKey: true }, { altKey: true }, { shiftKey: true }]) e.click(undefined, props);
  e.setVisit(null); e.click();
  assert.equal(e.history.pushes.length, 0); assert.equal(e.emitted.length, 0); e.stop();
});

test('only same origin/path/query hash changes use the helper', () => {
  const e = env();
  for (const href of ['https://evil.example/#work', 'https://anduril.psstmatt.com/other#work',
    'https://anduril.psstmatt.com/?view=other#work', 'https://anduril.psstmatt.com/?view=dive',
    'https://anduril.psstmatt.com/?view=dive#home',
    'https://anduril.psstmatt.com/?view=dive#__factory_return=v1.foo'])
    assert.equal(e.click(href).defaultPrevented, false);
  e.click(undefined, {}, { target: '_blank' }); e.click(undefined, {}, { download: '' });
  e.setBaseTarget('_blank'); e.click();
  assert.equal(e.history.pushes.length, 0); e.stop();
});

test('no generic hashchange or popstate listener can arm an unrelated history entry', () => {
  const e = env();
  assert.deepEqual([...e.listeners.keys()], ['click']);
  e.setVisit(null); e.location.href = 'https://anduril.psstmatt.com/?view=dive#older';
  e.click(); assert.equal(e.history.pushes.length, 0); e.stop();
});
