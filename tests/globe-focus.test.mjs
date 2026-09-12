import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/globe-geometry.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { focusLocation } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));

test('selected cities project to the center of COBE’s visible hemisphere', () => {
  for (const [latitude, longitude] of [[47.61,-122.33],[40.71,-74.01],[33.64,-117.92],[51.51,-.13],[35.68,139.65],[-33.87,151.21]]) {
    const { phi, theta } = focusLocation(latitude, longitude);
    // Independent reference: COBE v2 geographic-vector and camera projection.
    const lat = latitude * Math.PI / 180, lon = longitude * Math.PI / 180 - Math.PI;
    const x = -Math.cos(lat)*Math.cos(lon), y = Math.sin(lat), z = Math.cos(lat)*Math.sin(lon);
    const screenX = Math.cos(phi)*x+Math.sin(phi)*z;
    const screenY = Math.sin(phi)*Math.sin(theta)*x+Math.cos(theta)*y-Math.cos(phi)*Math.sin(theta)*z;
    const depth = -Math.sin(phi)*Math.cos(theta)*x+Math.sin(theta)*y+Math.cos(phi)*Math.cos(theta)*z;
    assert.ok(Math.abs(screenX) < 1e-8 && Math.abs(screenY) < 1e-8, `${latitude},${longitude} must center`);
    assert.ok(depth > .99, 'Must face the camera, not the back of the globe');
  }
});
