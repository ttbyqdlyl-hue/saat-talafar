// Wraps src/page.html (written for the Artifact viewer, which adds its own
// document skeleton) into a standalone page at public/index.html.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

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
<meta property="og:description" content="ساعات رجالية ونسائية وكلاسيك وذكية. تصفّح التشكيلة واطلب ساعتك برسالة على تيك توك.">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>
${head.trim()}
</head>
<body>
${body.trim()}
</body>
</html>
`;

mkdirSync(new URL('./public/', import.meta.url), { recursive: true });
writeFileSync(new URL('./public/index.html', import.meta.url), html);
writeFileSync(new URL('./public/.nojekyll', import.meta.url), '');
console.log('built public/index.html', (html.length / 1024).toFixed(1) + ' KB');
