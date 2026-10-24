// Wraps src/page.html (written for the Artifact viewer, which adds its own
// document skeleton) into a standalone page at docs/index.html for GitHub Pages.
// docs/data and docs/images belong to the owner panel and are never overwritten.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const src = readFileSync(new URL('./src/page.html', import.meta.url), 'utf8');
const [head, body] = src.split('<!-- page -->');
if (body === undefined) throw new Error('src/page.html is missing the <!-- page --> marker');

const favicon = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='29' fill='%2307080B' stroke='%23C9A15A' stroke-width='4'/><path d='M32 32V14M32 32l11 7' stroke='%23EAD3A2' stroke-width='4' stroke-linecap='round'/><circle cx='32' cy='32' r='3.5' fill='%23EAD3A2'/></svg>";

const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" href="${favicon}">
<meta property="og:type" content="website">
<meta property="og:locale" content="ar_IQ">
<meta property="og:title" content="ساعات تلعفر">
<meta property="og:description" content="ساعات ومحافظ وسبح ونظارات وعطور وإكسسوارات بتلعفر. تصفّح التشكيلة واطلب على واتساب.">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>
${head.trim()}
</head>
<body>
${body.trim()}
</body>
</html>
`;

mkdirSync(new URL('./docs/data/', import.meta.url), { recursive: true });
writeFileSync(new URL('./docs/index.html', import.meta.url), html);
writeFileSync(new URL('./docs/.nojekyll', import.meta.url), '');
const data = new URL('./docs/data/products.json', import.meta.url);
if (!existsSync(data)) writeFileSync(data, JSON.stringify({ settings: { whatsapp: '9647503321266', map: 'https://maps.app.goo.gl/vMUJ7ErkPsaVY9hb8', showSamples: true, hiddenSamples: [] }, products: [] }, null, 1) + '\n');
console.log('built docs/index.html', (html.length / 1024).toFixed(1) + ' KB');
