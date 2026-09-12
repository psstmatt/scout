import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/interview-data.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { opportunities, statusMeta, stageMeta } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
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
  const text = JSON.stringify(opportunities);
  assert.doesNotMatch(text, /passcode\s*[:=]\s*\w+|password\s*[:=]\s*\w+|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
});
