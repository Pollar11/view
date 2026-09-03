# View desktop

A [Tauri 2](https://tauri.app) shell that packages the Expo **web** export
(`apps/app/dist`) into a native window for macOS, Windows and Linux. Same client,
same API contract — just a thinner runtime than Electron (~10 MB vs ~150 MB).

## Prerequisites

- Rust (`rustup`) — <https://tauri.app/start/prerequisites/>
- Platform toolchain: Xcode CLT (macOS) · MSVC + WebView2 (Windows) · `webkit2gtk` + `libayatana-appindicator` (Linux)
- Node ≥ 18 with the workspace installed (`npm install` at the repo root)

## Develop

```bash
npm run dev        # runs `expo export --platform web`, then `tauri dev`
```

Point the app at an API by exporting the web build with the URL baked in:

```bash
EXPO_PUBLIC_API_URL=https://api.example.com/api npm run build:web
npm run tauri dev
```

## Package

```bash
npm run build
```

Installers land in `src-tauri/target/release/bundle/`:

| Platform | Artifact |
| --- | --- |
| macOS | `dmg/View_1.0.0_<arch>.dmg`, `macos/View.app` |
| Windows | `msi/View_1.0.0_x64_en-US.msi`, `nsis/View_1.0.0_x64-setup.exe` |
| Linux | `appimage/View_1.0.0_amd64.AppImage`, `deb/`, `rpm/` |

## Icons

Placeholder PNGs are in `src-tauri/icons/`. To regenerate the full set
(incl. `.icns` / `.ico`) from a single source image:

```bash
npm run tauri icon src-tauri/icons/app-icon.png
```

Then restore the `.icns`/`.ico` entries in
[`src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json) `bundle.icon`.

## Electron instead?

If you'd rather ship Electron: point `BrowserWindow.loadFile` at
`apps/app/dist/index.html`, set `webPreferences.contextIsolation: true`, and copy
the CSP from `tauri.conf.json`. The web build is a plain static SPA, so any
wrapper works.
