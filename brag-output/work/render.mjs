import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn } from 'child_process';
const FF = process.env.FF, FPS = 30, DUR = 30;
const ff = spawn(FF, ['-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','video.mp4'], { stdio: ['pipe','ignore','inherit'] });
const br = await chromium.launch();
const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + process.cwd() + '/reel.html');
await p.evaluate(() => window.ready);
for (let f = 0; f < FPS * DUR; f++) {
  await p.evaluate(t => render(t), f / FPS);
  const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await br.close();
