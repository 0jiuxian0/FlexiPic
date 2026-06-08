# FlexiPic

[中文](./README.zh.md)

Pure front-end image generator for creating placeholder images. Customize dimensions, background, text, and export format -- all in the browser, no server required.

## Features

- **Dimensions** -- Width/height inputs (1--10000), swap button, aspect ratio display and presets (16:9, 4:3, 1:1, 3:2, 21:9), common resolution presets
- **Background** -- Solid color or linear gradient with adjustable start/end colors and angle; random color/gradient button
- **Text** -- Multi-line text (default shows width, height, format on 3 lines), adjustable font size (auto or manual), auto text color (black/white or full inverse)
- **Export** -- PNG, JPEG (with quality slider), WebP (with quality slider, auto-fallback to PNG if unsupported)
- **Preview** -- Real-time preview with sticky scrolling
- **i18n** -- Chinese / English interface toggle

## Tech Stack

| Item | Choice |
|---|---|
| Build | Vite 6 + TypeScript |
| Rendering | HTML Canvas 2D API |
| Styling | Vanilla CSS (system dark/light theme) |
| Deploy | GitHub Actions to GitHub Pages |

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # output to dist/
npm run preview    # preview production build
```

## GitHub Pages Deployment

1. Push this repo to GitHub (repo name should match the `base` in `vite.config.ts`, default: `FlexiPic`)
2. Go to **Settings > Pages > Source** and select **Deploy from branch > gh-pages / root**
3. Push to `main` -- GitHub Actions will automatically build and deploy

Live URL: `https://<username>.github.io/FlexiPic/`

If your repo name is not `FlexiPic`, update the `base` value in [`vite.config.ts`](vite.config.ts).

## Project Structure

```
FlexiPic/
├── index.html
├── package.json
├── vite.config.ts
├── .github/workflows/deploy.yml
└── src/
    ├── main.ts          # Entry: event binding, state coordination
    ├── i18n.ts          # Chinese/English strings and language switching
    ├── state.ts         # AppState types and defaults
    ├── colors.ts        # Color utilities (random, inverse, luminance)
    ├── renderer.ts      # Canvas rendering (background + centered text)
    ├── exporter.ts      # Image export (PNG/JPEG/WebP) and download
    └── style.css        # Layout and responsive theme
```

## License

MIT
