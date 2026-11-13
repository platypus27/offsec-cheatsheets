# OffSec Cheatsheets

A personal, searchable, offline cheatsheet app for OffSec exam prep, built on
[`@kryv/teal`](https://github.com/platypus27/teal). Notes are plain Markdown;
the build is a single HTML file that opens straight from disk.

## Features

- **Navigation**: sidebar by section, breadcrumbs, prev/next, an outline of
  every page, pins and recent pages.
- **Search** (`/` or `Ctrl K`): full text over every heading, paragraph and
  command, with typo tolerance. A result opens at the exact heading.
- **Copy-ready commands**: `{{RHOST}}`-style placeholders are filled from your
  variables and active target, shown highlighted, and copied filled in.
- **Targets**: per-host address, variables, ports and notes. The active target
  supplies `RHOST` and overrides global variables.
- **Output parser**: paste nmap normal, grepable or XML output to extract ports,
  save hosts as targets, and get note suggestions from your own rules.
- **Playbooks**: decision trees you write in YAML, with links into your notes.
- **Encoders**: Base64, PowerShell `-EncodedCommand`, URL, hex, HTML entities
  and ROT13, all offline.
- **Checklists**: Markdown task lists become checkboxes with saved progress.

Everything personal (variables, targets, checks, pins) is stored in this
browser's localStorage only.

## Use

```bash
npm install
npm run dev        # http://localhost:4320
npm run build      # writes dist/index.html, a single self-contained file
```

Open `dist/index.html` directly in a browser, no server needed. Keyboard
shortcuts are listed under `?`.

## Write notes

See `content/start/authoring.md` (also the first page in the app):

- Pages: `content/<section>/<page>.md`, with optional `title`, `order`, `tags`
  frontmatter. Section titles and order go in `content/<section>/_meta.yaml`.
- Suggestion rules: `content/_rules.yaml`.
- Playbooks: `content/_playbooks/*.yaml`.

The section name `tools` and folders starting with `_` are reserved.

## Develop

```bash
npm run lint
npm run typecheck
npm test           # unit tests, plus a check that every note link, rule and
                   # playbook points at a page or heading that exists
npm run test:e2e   # Playwright: Chromium, Firefox, WebKit and mobile
npm run verify     # all of the above plus a build
```

The end-to-end suite builds against `e2e/fixtures/content`, so editing your
notes never breaks it.
