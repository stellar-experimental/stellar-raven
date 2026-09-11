import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
await mkdir('dist/server', { recursive: true });
await mkdir('dist/.openai', { recursive: true });
const files = await Promise.all(['index.html', 'app.js', 'style.css'].map(name => readFile(`public/${name}`, 'utf8')));
const assets = Object.fromEntries(files.map((body, i) => [[ '/', '/app.js', '/style.css' ][i], {
  body, type: ['text/html; charset=utf-8', 'text/javascript; charset=utf-8', 'text/css; charset=utf-8'][i]
}]));
const launchSource = (await readFile('src/launch.js', 'utf8')).replace(/^export /gm, '');
const source = await readFile('src/server.js', 'utf8');
await writeFile('dist/server/index.js', `const assets = ${JSON.stringify(assets)};\n${launchSource}\n${source.replace("import assets from './assets.js';", '').replace("import { renderLaunch, launchCsv, launchMarkdown } from './launch.js';", '')}`);
await cp('.openai/hosting.json', 'dist/.openai/hosting.json');
console.log('Built monthly and launch-to-date reports, with CSV and Markdown exports.');
