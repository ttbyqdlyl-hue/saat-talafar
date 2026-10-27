// Wraps src/page.html (written for the Artifact viewer, which adds its own
// document skeleton) into a standalone page at docs/index.html for GitHub Pages.
// docs/data and docs/images belong to the owner panel and are never overwritten.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const SITE = 'https://ttbyqdlyl-hue.github.io/saat-talafar/';
const at = p => new URL(p, import.meta.url);

const src = readFileSync(at('./src/page.html'), 'utf8');
let [head, body] = src.split('<!-- page -->');
if (body === undefined) throw new Error('src/page.html is missing the <!-- page --> marker');
head = head.replace(/<meta name="claude:[^>]*>\s*/g, ''); // Artifact-viewer hint, meaningless on a normal site
// Older phones (iOS < 14.5, old Android WebViews) ignore `inset`: write top/right/bottom/left in front of each one.
head = head.replace(/([{;\s])inset:([^;}]+)/g, (m, pre, v) => {
  const [t, r = t, b = t, l = r] = v.trim().split(/\s+/);
  return `${pre}top:${t};right:${r};bottom:${b};left:${l};inset:${v}`;
});
// …and `aspect-ratio` (iOS < 15): give the photo frames a height the old way.
const legacyCss = `<style>@supports not (aspect-ratio:1/1){
.stage{height:0;padding-top:100%}
.ow-ph{height:0;padding-top:100%}.ow-ph img{position:absolute;top:0;left:0}
.sheet-watch{width:min(330px,40vh)}.hero-watch{width:min(470px,72vw)}
}</style>`;

mkdirSync(at('./docs/data/'), { recursive: true });
const dataFile = at('./docs/data/products.json');
if (!existsSync(dataFile)) writeFileSync(dataFile, JSON.stringify({ settings: { whatsapp: '9647503321266', map: 'https://maps.app.goo.gl/vMUJ7ErkPsaVY9hb8', showSamples: true, hiddenSamples: [] }, products: [] }, null, 1) + '\n');
let settings = {};
try { settings = JSON.parse(readFileSync(dataFile, 'utf8')).settings || {}; } catch {}
const phone = String(settings.whatsapp || '9647503321266').replace(/\D/g, '');
const mapUrl = /^https:\/\//.test(settings.map || '') ? settings.map : 'https://maps.app.goo.gl/vMUJ7ErkPsaVY9hb8';
const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Content-Security-Policy: only this page's own inline script (by hash), GSAP from cdnjs, Google Fonts,
// and the GitHub API for the owner panel. Recomputed on every build because the script changes.
const scripts = [...body.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => `'sha256-${createHash('sha256').update(m[1], 'utf8').digest('base64')}'`);
const csp = [
  "default-src 'self'",
  `script-src 'self' https://cdnjs.cloudflare.com ${scripts.join(' ')}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data: blob:",
  "connect-src 'self' blob: https://api.github.com",
  "object-src 'none'", "base-uri 'none'", "form-action 'none'"
].join('; ');

const favicon = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='29' fill='%2307080B' stroke='%23C9A15A' stroke-width='4'/><path d='M32 32V14M32 32l11 7' stroke='%23EAD3A2' stroke-width='4' stroke-linecap='round'/><circle cx='32' cy='32' r='3.5' fill='%23EAD3A2'/></svg>";
const description = 'ساعات ومحافظ وسبح ونظارات وعطور وإكسسوارات بتلعفر. تصفّح التشكيلة واطلب على واتساب.';
const hasOg = existsSync(at('./docs/og.jpg')), hasIcon = existsSync(at('./docs/icon-180.png'));
const store = {
  '@context': 'https://schema.org', '@type': 'Store', name: 'ساعات تلعفر', url: SITE, description,
  telephone: '+' + phone, hasMap: mapUrl,
  address: { '@type': 'PostalAddress', addressLocality: 'تلعفر', addressRegion: 'نينوى', addressCountry: 'IQ' },
  ...(hasOg ? { image: SITE + 'og.jpg' } : {})
};

const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<link rel="canonical" href="${SITE}">
<link rel="icon" href="${favicon}">
${hasIcon ? '<link rel="apple-touch-icon" href="icon-180.png">\n' : ''}<meta property="og:type" content="website">
<meta property="og:site_name" content="ساعات تلعفر">
<meta property="og:locale" content="ar_IQ">
<meta property="og:url" content="${SITE}">
<meta property="og:title" content="ساعات تلعفر">
<meta property="og:description" content="${description}">
${hasOg ? `<meta property="og:image" content="${SITE}og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="ساعات تلعفر">
<meta name="twitter:card" content="summary_large_image">
` : ''}<script type="application/ld+json">${JSON.stringify(store).replace(/</g, '\\u003c')}</script>
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>
${head.trim()}
${legacyCss}
</head>
<body>
<noscript><p style="margin:0;padding:14px 16px;background:#16110A;color:#F3EEE5;font:15px/1.7 Tahoma,sans-serif;text-align:center">الموقع يحتاج تشغيل JavaScript حتى تطلع المنتجات. تكدر تطلب مباشرة على واتساب: <a style="color:#EAD3A2" href="https://wa.me/${phone}">+${phone}</a></p></noscript>
${body.trim()}
</body>
</html>
`;

const notFound = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>الصفحة مو موجودة · ساعات تلعفر</title>
<link rel="icon" href="${favicon}">
<style>
:root{color-scheme:dark}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#07080B;color:#F3EEE5;font:16px/1.8 "Segoe UI",Tahoma,sans-serif;text-align:center}
h1{margin:0 0 8px;font-size:30px}
p{margin:0 0 24px;color:#9AA2B1}
a{display:inline-block;margin:6px;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600}
.gold{background:linear-gradient(135deg,#F5E1AE,#C9A15A 48%,#A27833);color:#16110A}
.wa{border:1px solid #2A3242;color:#F3EEE5}
</style>
</head>
<body>
<main>
<h1>الصفحة مو موجودة</h1>
<p>يمكن الرابط مكتوب غلط. ارجع لمحل ساعات تلعفر وشوف التشكيلة.</p>
<a class="gold" href="${SITE}">رجوع للموقع</a>
<a class="wa" href="https://wa.me/${escAttr(phone)}">راسلنا على واتساب</a>
</main>
</body>
</html>
`;

writeFileSync(at('./docs/index.html'), html);
writeFileSync(at('./docs/404.html'), notFound);
writeFileSync(at('./docs/.nojekyll'), '');
console.log('built docs/index.html', (html.length / 1024).toFixed(1) + ' KB', hasOg ? '(with preview image)' : '(no preview image yet)');
