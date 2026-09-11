import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { renderLaunch, launchCsv, launchMarkdown } from './src/launch.js';
await mkdir('dist/server', { recursive: true });
await mkdir('dist/.openai', { recursive: true });
const files = await Promise.all(['index.html', 'app.js', 'style.css'].map(name => readFile(`public/${name}`, 'utf8')));
const assets = Object.fromEntries(files.map((body, i) => [[ '/', '/app.js', '/style.css' ][i], {
  body, type: ['text/html; charset=utf-8', 'text/javascript; charset=utf-8', 'text/css; charset=utf-8'][i]
}]));
const launch = JSON.parse(await readFile('public/launch-data.json', 'utf8'));
assets['/launch'] = { body: renderLaunch(launch), type: 'text/html; charset=utf-8' };
assets['/launch.csv'] = { body: launchCsv(launch), type: 'text/csv; charset=utf-8' };
assets['/launch-report.md'] = { body: launchMarkdown(launch), type: 'text/markdown; charset=utf-8' };
const source = await readFile('src/server.js', 'utf8');
await writeFile('dist/server/index.js', `const assets = ${JSON.stringify(assets)};\n${source.replace("import assets from './assets.js';", '')}`);
await cp('.openai/hosting.json', 'dist/.openai/hosting.json');
console.log('Built monthly and launch-to-date reports, with CSV and Markdown exports.');
