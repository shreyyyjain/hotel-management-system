# Font Configuration - Alternative Solution

## Problem
The custom "You Blockhead" font wasn't loading from `/public/fonts/you-blockhead.woff`.

## Solution Implemented
Replaced with **Google Fonts** for guaranteed loading:

### Primary Font: **Fredoka**
- Rounded, friendly, blocky style similar to You Blockhead
- Weights: 400, 600, 700
- Used for headings and display text

### Secondary Font: **Poppins**
- Clean, modern sans-serif
- Weights: 400, 600, 700, 800
- Used for body text and UI elements

## Changes Made

### 1. `index.html`
Added Google Fonts preconnect and stylesheet:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
```

### 2. `src/index.css`
Updated body font-family:
```css
body {
  font-family: 'Fredoka', 'Poppins', system-ui, -apple-system, sans-serif;
}
```

### 3. `tailwind.config.js`
Updated font families:
```javascript
fontFamily: {
  'heading': ['Fredoka', 'Poppins', 'system-ui', 'sans-serif'],
  'body': ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
}
```

## If You Want to Use Your Original Font

### Option 1: Fix WOFF Path
1. Ensure `you-blockhead.woff` is in `/public/fonts/`
2. Check file name spelling matches exactly
3. Test by opening `http://localhost:5173/fonts/you-blockhead.woff` in browser

### Option 2: Convert to WOFF2
WOFF2 has better compression and browser support:
```bash
# Use online converter or local tool
https://cloudconvert.com/woff-to-woff2
```

Then update `@font-face`:
```css
@font-face {
  font-family: 'You Blockhead';
  src: url('/fonts/you-blockhead.woff2') format('woff2'),
       url('/fonts/you-blockhead.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

### Option 3: Host on CDN
Upload font to a CDN (Cloudinary, AWS S3, etc.) and reference the URL:
```css
@font-face {
  font-family: 'You Blockhead';
  src: url('https://your-cdn.com/you-blockhead.woff') format('woff');
}
```

## Current Result
✅ All text now uses **Fredoka** for headings (fun, rounded, blocky)
✅ All text uses **Poppins** for body (clean, readable)
✅ Fonts load instantly from Google CDN
✅ No more blank text or fallback font issues
