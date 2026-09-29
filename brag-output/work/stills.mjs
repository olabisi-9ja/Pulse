import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const ts = process.argv.slice(2).map(Number);
const br = await chromium.launch();
const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + process.cwd() + '/reel.html');
await p.evaluate(() => window.ready);
for (const t of ts) { await p.evaluate(t => render(t), t); await p.screenshot({ path: `still-${t.toFixed(2)}.jpg`, quality: 70, type: 'jpeg' }); }
await br.close();
