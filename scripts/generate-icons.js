import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Standard SVG for normal icons
const svgStandard = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f766e" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="120" y1="120" x2="392" y2="392" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="200" y1="180" x2="320" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>

  <!-- Background rounded rectangle -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)" />

  <!-- Subtle glowing circle -->
  <circle cx="256" cy="256" r="190" stroke="url(#glowGrad)" stroke-width="3" opacity="0.35" stroke-dasharray="12 8" />

  <!-- Myofascial Flow Curves (representing connective tissue tension release) -->
  <path d="M 140 230 C 180 150, 332 150, 372 230 C 332 310, 180 310, 140 230 Z" fill="none" stroke="url(#glowGrad)" stroke-width="8" stroke-linecap="round" opacity="0.4" />
  <path d="M 160 256 C 200 190, 312 190, 352 256 C 312 322, 200 322, 160 256 Z" fill="none" stroke="url(#goldGrad)" stroke-width="10" stroke-linecap="round" />

  <!-- Center Hands / Spine Fascia Node Symbol -->
  <circle cx="256" cy="256" r="44" fill="#042f2e" stroke="url(#goldGrad)" stroke-width="6" />
  <path d="M 240 256 L 256 240 L 272 256 L 256 272 Z" fill="#2dd4bf" />

  <!-- Inner Monogram RO -->
  <text x="256" y="380" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="34" fill="#f8fafc" letter-spacing="4">RENATA OKOTI</text>
  <text x="256" y="415" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="600" font-size="20" fill="#2dd4bf" letter-spacing="5">LIBERAÇÃO MIOFASCIAL</text>
</svg>
`;

// Maskable SVG with central 80% safe zone
const svgMaskable = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradMask" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f766e" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>
    <linearGradient id="glowGradMask" x1="120" y1="120" x2="392" y2="392" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>
    <linearGradient id="goldGradMask" x1="200" y1="180" x2="320" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>

  <!-- Full-bleed background for maskable -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <!-- Central safe area scaled down ~80% -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <circle cx="256" cy="256" r="180" stroke="url(#glowGradMask)" stroke-width="4" opacity="0.3" stroke-dasharray="10 6" />

    <path d="M 140 230 C 180 150, 332 150, 372 230 C 332 310, 180 310, 140 230 Z" fill="none" stroke="url(#glowGradMask)" stroke-width="10" stroke-linecap="round" opacity="0.4" />
    <path d="M 160 256 C 200 190, 312 190, 352 256 C 312 322, 200 322, 160 256 Z" fill="none" stroke="url(#goldGradMask)" stroke-width="12" stroke-linecap="round" />

    <circle cx="256" cy="256" r="48" fill="#042f2e" stroke="url(#goldGradMask)" stroke-width="6" />
    <path d="M 238 256 L 256 238 L 274 256 L 256 274 Z" fill="#2dd4bf" />

    <text x="256" y="380" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="34" fill="#ffffff" letter-spacing="4">RENATA OKOTI</text>
    <text x="256" y="415" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="600" font-size="20" fill="#2dd4bf" letter-spacing="5">MIOFASCIAL APK</text>
  </g>
</svg>
`;

async function run() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgStandard.trim());

  const svgBuf = Buffer.from(svgStandard);
  const maskableBuf = Buffer.from(svgMaskable);

  // 192x192
  await sharp(svgBuf)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512
  await sharp(svgBuf)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 512x512 maskable
  await sharp(maskableBuf)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Apple touch icon 180x180
  await sharp(svgBuf)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Favicon PNG 64x64
  await sharp(svgBuf)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  // Favicon ICO (or PNG fallback)
  await sharp(svgBuf)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('✅ Icons successfully generated in public/ directory!');
}

run().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
