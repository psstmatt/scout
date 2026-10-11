import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const read = name => readFileSync(new URL(`../src/${name}`, import.meta.url), 'utf8');
function compile(name, dependencies = {}) {
  const exports = {};
  const output = ts.transpileModule(read(name), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('exports', 'require', output)(exports, id => { if (!(id in dependencies)) throw Error(`Unexpected dependency ${id}`); return dependencies[id]; });
  return exports;
}
const interview = compile('interview-data.ts');
const pipeline = compile('pipeline-data.ts', { './interview-data': interview });
const geography = compile('geography-data.ts');

test('list, Sankey and geography conserve the same scope after every status filter', () => {
  const scopes = [interview.opportunities, [], ...Object.keys(interview.statusMeta).map(status => interview.opportunities.filter(record => record.status === status))];
  for (const records of scopes) {
    const graph = pipeline.buildPipeline(records), globe = geography.buildGeography(records);
    assert.equal(graph.total, records.length);
    assert.equal(globe.total, graph.total);
    assert.equal(globe.counts.located + globe.counts.remote + globe.counts.unknown, graph.total);
    assert.deepEqual(globe.records.map(item => item.id), graph.records.map(item => item.id));
  }
});

test('Scout neutralizes additive Tailwind transforms in the cross-build overlays', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.pipeline-dialog\[data-state="open"\]\s*\{[^}]*transform:\s*translate\(-50%, -50%\);[^}]*translate:\s*none/s);
  assert.match(css, /\.scout-tooltip svg\s*\{[^}]*translate:\s*none;[^}]*rotate:\s*none/s);
});

test('inspector return focus uses stable visible list rows and overview loads on demand', () => {
  const source = read('page.tsx');
  assert.match(source, /conversationButtons\.current\.get\(selectedId\) \?\? totalButton\.current/);
  assert.doesNotMatch(source, /lastSelected/);
  assert.match(source, /lazy\(\(\) => import\("\.\/pipeline-sankey"\)/);
  assert.match(source, /<RoleGeography filteredOpportunities=\{filtered\}/);
  assert.match(source, /<Input className="scout-input"/);
});
