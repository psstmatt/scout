import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/interview-data.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { opportunities, relationshipArchive, statusMeta, stageMeta } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
test('each role has a unique ID and coherent status', () => {
  assert.equal(new Set(opportunities.map(item => item.id)).size, opportunities.length, 'Duplicate IDs break selection');
  for (const item of opportunities) {
    assert.ok(statusMeta[item.status], item.id);
    assert.ok(stageMeta[item.stage], item.id);
    assert.ok(!Number.isNaN(Date.parse(item.lastTouch)), item.id);
    if (item.status === 'closed') assert.equal(item.stage, 'closed', item.id);
    assert.ok(item.next.action && item.next.owner && item.next.evidence, item.id);
  }
});
test('public summaries exclude meeting access codes and email addresses', () => {
  const text = JSON.stringify([...opportunities, ...relationshipArchive]);
  assert.doesNotMatch(text, /passcode\s*[:=]\s*\w+|password\s*[:=]\s*\w+|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
});

test('public summaries do not expose private source or meeting destinations', () => {
  const text = JSON.stringify([...opportunities, ...relationshipArchive]);
  assert.doesNotMatch(text, /mail\.google\.com|calendar\.google\.com|(?:www\.)?google\.com\/calendar|(?:app|notes)\.granola\.ai|meet\.google\.com|zoom\.us\/(?:j|s)\/|chime\.aws|teams\.microsoft|webex\.com|event\?eid|mailto:/i);
});

test('scheduled opportunities have a current next step', () => {
  for (const item of opportunities.filter(item => item.status === 'scheduled')) {
    assert.doesNotMatch(item.next.due, /\b(?:Aug|Sep)\b/, item.id);
  }
});


test('audited closures and signed outcome cannot regress into active states', () => {
  for (const id of ['whatnot-product-designer', 'snap-interface-designer', 'rippling', 'onx', 'vanguard', 'gm-in-vehicle', 'gm-ux-insight', 'shield-ai', 'paypal']) {
    const record = opportunities.find(item => item.id === id);
    assert.equal(record.status, 'closed', id);
    assert.equal(record.stage, 'closed', id);
  }
  assert.equal(opportunities.find(item => item.id === 'apfm').status, 'signed');
  assert.equal(opportunities.find(item => item.id === 'amazon').status, 'scheduled');
});

test('separate role applications and archived relationships preserve identity without inflating candidacy totals', () => {
  const ids = opportunities.map(item => item.id);
  const archiveIds = relationshipArchive.map(item => item.id);
  assert.equal(new Set([...ids, ...archiveIds]).size, ids.length + archiveIds.length);
  for (const id of ['creative-people', 'decimals-ridd-network', 'atlas-gate']) {
    assert.ok(archiveIds.includes(id));
    assert.ok(!ids.includes(id));
  }
  for (const id of ['stripe-global-payments', 'paypal-staff-risk-intelligence', 'nintendo-sr-ux-writer-august-10', 'nintendo-contract-associate-game-designer']) assert.ok(ids.includes(id));
  assert.equal(opportunities.find(item => item.id === 'atoms').status, 'unknown');
});
