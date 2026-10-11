import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';
const source = resolve(process.argv[2] || '../sites/interview-conversation-map');
const root = new URL('../', import.meta.url);
for (const name of ['page.tsx', 'globe.tsx', 'globe-geometry.ts', 'globe-fallback.ts', 'land-points.json', 'interview-data.ts', 'refresh-metadata.ts', 'use-sounds.ts', 'milestone-data.ts', 'milestone-journey.tsx', 'pipeline-data.ts', 'pipeline-sankey.tsx', 'geography-data.ts', 'role-geography.tsx']) {
  cpSync(resolve(source, 'app', name), new URL('src/' + name, root));
}
for (const folder of ['ui', 'lib']) cpSync(resolve(source, 'app', folder), new URL('src/' + folder, root), { recursive: true });
writeFileSync(new URL('src/styles.css', root), readFileSync(resolve(source, 'app/globals.css'), 'utf8').replace('@import "tailwindcss";', ''));
mkdirSync(new URL('public', root), { recursive: true });
cpSync(resolve(source, 'public/fonts'), new URL('public/fonts', root), { recursive: true });
cpSync(resolve(source, 'public/og.jpg'), new URL('public/og.jpg', root));
for (const name of ['data-integrity.test.mjs', 'globe-focus.test.mjs', 'milestones.test.mjs', 'pipeline-sankey.test.mjs', 'geography.test.mjs', 'scout-polish.test.mjs']) {
  writeFileSync(new URL('tests/' + name, root), readFileSync(resolve(source, 'tests', name), 'utf8').replaceAll('../app/', '../src/').replaceAll('../src/globals.css', '../src/styles.css'));
}
console.log('Synced public interview UI, data, fonts, share image, and validation.');

const pageUrl = new URL('src/page.tsx', root);
let page = readFileSync(pageUrl, 'utf8');
page = 'import { profileLinks } from "./profile-links";\n' + page;
page = page.replace('<strong>{person.name}</strong>', '<strong>{profileLinks[person.name] ? <a href={profileLinks[person.name]} target="_blank" rel="noreferrer">{person.name} ↗</a> : person.name}</strong>');
writeFileSync(pageUrl, page);
