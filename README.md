<div align="center">

![header](https://capsule-render.vercel.app/api?type=venom&height=300&color=0:5339B2,50:2F0565,100:0B0718&text=TUFExtension&fontColor=F5F5F5)

### Bring TUF levels and clears directly onto video pages

<p align="center">
  <img alt="ts" src="https://img.shields.io/badge/TS-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white" />
  <img alt="bun" src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" />
  <img alt="react" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="wxt" src="https://img.shields.io/badge/WXT-111827?style=for-the-badge&logoColor=white" />
  <img alt="tailwind" src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<p>
  Find TUF matches from YouTube and Bilibili videos,<br/>
  inspect level and pass details in an injected drawer,<br/>
  and jump back to TUF when you need the full page.
</p>

</div>

---

This repository contains the source tree for **TUFExtension**.  
TUFExtension is an unofficial browser extension for viewing [The Universal Forums](https://tuforums.com/) data directly inside video pages.

- Resolve TUF levels from YouTube / Bilibili video URLs
- Resolve TUF passes / clear videos
- Render an injected drawer UI isolated with Shadow DOM
- Use the current TUF login session for level likes
- Build and package Chrome / Firefox releases

---

## Features

| Feature                  | Description                                                                    |
| ------------------------ | ------------------------------------------------------------------------------ |
| Video matching           | Searches TUF levels and passes from the current YouTube / Bilibili video ID.   |
| Injected drawer          | Renders an in-page drawer instead of relying on Chrome's side panel API.       |
| Level detail             | Shows difficulty, PP, tags, curation, stats, and leaderboard in a TUF-like UI. |
| Pass detail              | Shows player, score, accuracy, speed, judgements, and spoiler reveal controls. |
| Likes                    | Reads and toggles level likes through the current TUF login session.           |
| Pin mode                 | Keeps the drawer open across navigation and updates results live.              |
| Chrome / Firefox package | Builds and packages browser-specific extension zips with WXT.                  |

---

## Repository Structure

```text
.
├── src/
│   ├── entrypoints/
│   │   ├── background/       # WXT background service worker entrypoint
│   │   └── content/          # WXT content script entrypoint
│   ├── platform/
│   │   ├── chrome/           # Runtime messaging and extension context helpers
│   │   └── content-script/   # Host-page integration, URL watching, button anchors
│   ├── domain/
│   │   ├── tuf/              # TUF API clients, mappers, filters, domain types
│   │   └── video/            # YouTube / Bilibili video reference parsing
│   ├── features/
│   │   ├── drawer/           # Drawer state and data-loading hooks
│   │   └── tuf-button/       # Injected TUF button rendering
│   ├── drawer/
│   │   ├── components/       # Drawer-level controls
│   │   ├── features/
│   │   │   ├── level-page/   # Level detail UI and leaderboard
│   │   │   └── pass-page/    # Pass detail UI and spoiler controls
│   │   └── shared/           # Drawer visual helpers, icons, formatters
│   ├── shared/               # Cross-runtime utilities
│   └── styles/               # Tailwind entrypoint
├── public/                   # Extension icons, fonts, static assets
├── .github/workflows/        # CI and release workflows
├── wxt.config.ts
└── package.json
```

---

## Quick Start

```bash
bun install
bun run dev
```

After starting the dev server, load the WXT-generated development extension from your browser's extension management page.

```text
.output/chrome-mv3
```

Use the Firefox dev mode when working against Firefox:

```bash
bun run dev:firefox
```

---

## Scripts

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `bun run dev`           | Run Chrome MV3 dev mode        |
| `bun run dev:firefox`   | Run Firefox dev mode           |
| `bun run build`         | Build Chrome MV3 production    |
| `bun run build:firefox` | Build Firefox production       |
| `bun run zip`           | Create a Chrome release zip    |
| `bun run zip:firefox`   | Create a Firefox release zip   |
| `bun run typecheck`     | Run TypeScript noEmit check    |
| `bun run format`        | Format files with Prettier     |
| `bun run format:check`  | Check formatting with Prettier |

---

## Verification

Run the same baseline checks used by PR CI:

```bash
bun run format:check
bun run typecheck
bun run build
```

---

## Contributing

Branch naming and commit message conventions are documented in [CONTRIBUTING.md](./CONTRIBUTING.md).
