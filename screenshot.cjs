const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  const allLogs = [];
  page.on('console', msg => allLogs.push(`[${msg.type()}] ${msg.text()}`));
  await page.goto('http://localhost:3000/conference', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(5000);

  // Check if SVG loads from the dev server
  const svgCheck = await page.evaluate(async () => {
    try {
      const r = await fetch('/cvpr-logo.svg');
      return `status:${r.status} ok:${r.ok} contentType:${r.headers.get('content-type')}`;
    } catch(e) { return 'fetch failed: ' + e.message; }
  });
  console.log('SVG fetch:', svgCheck);

  // Check Image loading
  const imgCheck = await page.evaluate(() => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(`loaded ok: w=${img.naturalWidth} h=${img.naturalHeight}`);
      img.onerror = (e) => resolve(`error: ${e}`);
      setTimeout(() => resolve('timeout'), 3000);
      img.src = '/cvpr-logo.svg';
    });
  });
  console.log('Image load:', imgCheck);

  // Try building a small test canvas and check output
  const canvasTest = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 10; c.height = 10;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 10, 10);
    const px = ctx.getImageData(0,0,1,1).data;
    return `canvas works: rgba(${Array.from(px).join(',')})`;
  });
  console.log('Canvas test:', canvasTest);

  // Very close to a poster board (at z=-6, x=-23, so 0.5 units away)
  await page.evaluate(() => {
    const cam = window.__debugCamera;
    if (!cam) { console.log('no cam'); return; }
    cam.position.set(-23, 1.7, -5.5);  // very close to front board
    cam.rotation.set(0, Math.PI, 0);   // looking at the board face (+z direction means face is toward us)
    cam.updateMatrixWorld(true);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/micha/AppData/Local/Temp/poster-closeup.png' });
  console.log('Close-up saved');
  console.log('All logs:', allLogs.filter(l => !l.includes('[HMR]')).slice(0, 20));
  await browser.close();
})();
