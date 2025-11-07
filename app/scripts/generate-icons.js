/**
 * PWA Icon Generator Script
 *
 * This script generates placeholder SVG icons for the PWA.
 * For production, you should replace these with properly designed PNG icons.
 *
 * To use this script:
 * 1. Install dependencies: npm install sharp (optional, for PNG conversion)
 * 2. Run: node scripts/generate-icons.js
 *
 * For production-quality icons, use a tool like:
 * - https://www.pwabuilder.com/imageGenerator
 * - https://realfavicongenerator.net/
 * - Adobe Illustrator / Figma / Inkscape
 */

const fs = require('fs');
const path = require('path');

// SVG template for the app icon
const createSvgIcon = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.15}"/>
  <g transform="translate(${size * 0.15}, ${size * 0.15})">
    <!-- Wallet icon -->
    <rect x="${size * 0.1}" y="${size * 0.25}" width="${size * 0.5}" height="${size * 0.4}"
          fill="white" opacity="0.9" rx="${size * 0.03}"/>
    <circle cx="${size * 0.55}" cy="${size * 0.45}" r="${size * 0.05}" fill="#3b82f6"/>
    <!-- Coin -->
    <circle cx="${size * 0.5}" cy="${size * 0.2}" r="${size * 0.12}" fill="#fbbf24" opacity="0.95"/>
    <text x="${size * 0.5}" y="${size * 0.23}" font-family="Arial, sans-serif"
          font-size="${size * 0.12}" font-weight="bold" fill="#3b82f6" text-anchor="middle">₹</text>
  </g>
</svg>`;

// Generate SVG icons
const publicDir = path.join(__dirname, '..', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192 icon
const svg192 = createSvgIcon(192);
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), svg192);
console.log('✓ Generated icon-192.svg');

// Generate 512x512 icon
const svg512 = createSvgIcon(512);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), svg512);
console.log('✓ Generated icon-512.svg');

// Generate favicon
const favicon = createSvgIcon(64);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), favicon);
console.log('✓ Generated favicon.svg');

// Generate apple-touch-icon (180x180)
const appleIcon = createSvgIcon(180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), appleIcon);
console.log('✓ Generated apple-touch-icon.svg');

console.log('\n📝 Note: These are SVG placeholders.');
console.log('For production, convert these to PNG using a tool like:');
console.log('  - https://www.pwabuilder.com/imageGenerator');
console.log('  - ImageMagick: convert icon-192.svg icon-192.png');
console.log('  - Online converter: https://cloudconvert.com/svg-to-png');
