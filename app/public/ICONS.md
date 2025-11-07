# PWA Icon Setup

Your PWA icons are currently SVG format. For best compatibility, convert them to PNG:

## Current Files (SVG)
- icon-192.svg
- icon-512.svg
- apple-touch-icon.svg
- favicon.svg

## Needed Files (PNG)
- icon-192.png (192x192)
- icon-512.png (512x512)
- apple-touch-icon.png (180x180)
- favicon.ico (64x64)

## Conversion Options

### 1. Online Tool (Recommended)
Visit: https://www.pwabuilder.com/imageGenerator
- Upload icon-512.svg
- Download all generated sizes
- Replace files in public/

### 2. ImageMagick (Command Line)
```bash
cd app/public
convert -background none icon-192.svg -resize 192x192 icon-192.png
convert -background none icon-512.svg -resize 512x512 icon-512.png
convert -background none apple-touch-icon.svg -resize 180x180 apple-touch-icon.png
convert -background none favicon.svg -resize 64x64 favicon.ico
```

### 3. Node.js with sharp
```bash
npm install sharp
node scripts/svg-to-png.js
```

The SVG icons will work for most browsers, but PNG provides better compatibility.
