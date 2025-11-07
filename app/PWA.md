# PWA Configuration Guide

## Overview

Darik is configured as a Progressive Web App (PWA) with full offline support, background sync, and installability.

## Features Implemented

### ✅ PWA Basics
- **Service Worker**: Serwist-based service worker with custom cache strategies
- **Manifest**: Web app manifest with app metadata, icons, and shortcuts
- **Icons**: SVG icons (with PNG fallback support)
- **Meta Tags**: Complete PWA meta tags in root layout

### ✅ Offline Support
- **Cache Strategies**:
  - Navigation: NetworkFirst (3s timeout)
  - API calls: NetworkFirst (5s timeout)
  - Static assets (JS/CSS): CacheFirst (30 days)
  - Images: CacheFirst (7 days, max 100)
  - Fonts: CacheFirst (1 year, max 30)
  - Default: StaleWhileRevalidate (1 day)
- **Offline Page**: `/offline` with helpful messaging
- **Offline Indicator**: Yellow banner when offline

### ✅ Background Sync
- Service worker registers background sync events
- Syncs transactions when coming back online
- Syncs on app visibility change (foreground)
- Manual sync trigger available

### ✅ Share Target
- Accepts text from other apps (SMS, WhatsApp, etc.)
- Accepts images (receipts, screenshots)
- Share handler at `/share`
- Parses shared text through expense parser

### ✅ Install Prompt
- Custom install prompt component
- Shows after 10 seconds (not pushy)
- Dismissible with 7-day cooldown
- Auto-hides if already installed

### ✅ Performance Optimizations
- Package import optimization (Dexie, date-fns, etc.)
- Console.log removal in production
- Security headers (X-Frame-Options, CSP, etc.)
- Cache headers for manifest and service worker
- Lazy loading utilities

## File Structure

```
app/
├── app/
│   ├── sw.ts                    # Service worker
│   ├── layout.tsx               # PWA meta tags
│   ├── offline/page.tsx         # Offline fallback
│   └── share/page.tsx           # Share target handler
├── components/
│   └── pwa/
│       ├── PWAProvider.tsx      # PWA wrapper component
│       └── InstallPrompt.tsx    # Install prompt UI
├── hooks/
│   └── useServiceWorker.ts      # Service worker hook
├── lib/
│   └── utils/
│       └── lazy.ts              # Lazy loading utilities
├── public/
│   ├── manifest.json            # Web app manifest
│   ├── icon-192.svg             # PWA icon (192x192)
│   ├── icon-512.svg             # PWA icon (512x512)
│   ├── apple-touch-icon.svg     # iOS icon (180x180)
│   ├── favicon.svg              # Favicon
│   └── ICONS.md                 # Icon conversion guide
├── scripts/
│   ├── generate-icons.js        # Icon generator
│   └── create-png-icons.js      # PNG conversion instructions
└── next.config.ts               # Next.js + Serwist config
```

## Usage

### Development

Service worker is disabled in development by default:

```bash
npm run dev
```

To test PWA features in development:

```ts
// next.config.ts
disable: false  // Enable service worker in dev
```

### Production Build

```bash
npm run build
npm run start
```

The service worker is automatically generated at `public/sw.js`.

### Testing PWA

1. **Install Prompt**:
   - Open app in browser
   - Wait 10 seconds
   - Click "Install" in the prompt

2. **Offline Mode**:
   - Open DevTools → Network
   - Set to "Offline"
   - Navigate around the app
   - Add transactions offline
   - Go back online → auto-sync

3. **Share Target** (Android/iOS):
   - Open another app (SMS, WhatsApp)
   - Select text
   - Tap "Share" → Choose "Darik"
   - Shared text appears in capture input

4. **Background Sync**:
   - Add transactions while offline
   - Close the app
   - Go online
   - Open the app → background sync triggers

## Icon Generation

### Current Status

SVG icons are generated and work in modern browsers. For better compatibility:

### Option 1: Online Tool (Recommended)

1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload `app/public/icon-512.svg`
3. Download all generated sizes
4. Place in `app/public/`

### Option 2: ImageMagick

```bash
cd app/public
convert -background none icon-192.svg -resize 192x192 icon-192.png
convert -background none icon-512.svg -resize 512x512 icon-512.png
convert -background none apple-touch-icon.svg -resize 180x180 apple-touch-icon.png
convert -background none favicon.svg -resize 64x64 favicon.ico
```

### Option 3: Design Custom Icons

Replace the generated SVG icons with custom-designed ones:

- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `apple-touch-icon.png` (180x180)
- `favicon.ico` (64x64)

## PWA Shortcuts

Three app shortcuts are configured:

1. **Add Expense**: Opens home with `?action=expense`
2. **Add Income**: Opens home with `?action=income`
3. **Portfolio**: Opens `/portfolio`

Long-press the app icon to see shortcuts (Android/Windows).

## Security Headers

The following headers are set for all routes:

- `X-DNS-Prefetch-Control: on`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Cache Management

### Automatic Cache Cleanup

The service worker automatically cleans up old cache entries:

- Static assets: Max 60 entries, 30 days
- Images: Max 100 entries, 7 days
- Fonts: Max 30 entries, 1 year
- Default cache: Max 50 entries, 1 day

### Manual Cache Clear

In DevTools:

1. Application → Storage → Clear site data
2. Or: Application → Service Workers → Unregister

## Monitoring

### Service Worker Status

Check in DevTools → Application → Service Workers:

- Status: Activated and running
- Scope: /
- Source: /sw.js

### Cache Storage

Check in DevTools → Application → Cache Storage:

- `pages-cache`: HTML pages
- `api-cache`: API responses
- `static-assets`: JS/CSS
- `images-cache`: Images
- `fonts-cache`: Fonts
- `default-cache`: Other resources

### Background Sync

Check in DevTools → Application → Background Sync:

- `sync-transactions`: Transaction sync queue

## Troubleshooting

### Service Worker Not Registering

1. Check HTTPS (required for service workers)
2. Check browser console for errors
3. Verify `/sw.js` is accessible
4. Clear browser cache and reload

### Install Prompt Not Showing

1. Wait 10 seconds after page load
2. Check if already installed (standalone mode)
3. Check if dismissed recently (7-day cooldown)
4. Clear localStorage: `localStorage.removeItem('pwa-install-dismissed')`

### Offline Mode Not Working

1. Check service worker status
2. Verify cache strategies in `/sw.js`
3. Check IndexedDB for local data
4. Test network offline in DevTools

### Share Target Not Working

1. Only works on installed PWA
2. Android/Windows support (limited iOS support)
3. Check manifest.json share_target config
4. Verify `/share` route exists

## Performance Tips

1. **Lazy Loading**: Use the `lazyLoad()` utility for heavy components
2. **Bundle Analysis**: Run `npm run build` and check bundle sizes
3. **Image Optimization**: Use Next.js `<Image>` component
4. **Code Splitting**: Use dynamic imports for routes
5. **Tree Shaking**: Remove unused dependencies

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Install Prompt | ✅ | ✅ | ⚠️ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |
| Share Target | ✅ | ❌ | ⚠️ | ✅ |
| Offline Support | ✅ | ✅ | ✅ | ✅ |

✅ Fully supported | ⚠️ Partial support | ❌ Not supported

## Next Steps

- [ ] Convert SVG icons to PNG for better compatibility
- [ ] Add dark mode theme color support
- [ ] Implement push notifications (Phase 9)
- [ ] Add periodic background sync for price updates
- [ ] Optimize bundle size further with code splitting
- [ ] Add web performance monitoring

## Resources

- [Serwist Documentation](https://serwist.pages.dev/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
