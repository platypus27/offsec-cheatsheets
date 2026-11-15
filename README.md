# OffSec Cheatsheets

A personal, searchable, offline cheatsheet app for OffSec exam prep, built on
[`@kryv/teal`](https://github.com/platypus27/teal). Notes are plain Markdown;
the build is a single HTML file that opens straight from disk.

The current cheatsheets and companions cover **OSCP (PEN-200) only**. OSWP and
OSEP content are outside the current reference. The persistent OSCP badge
identifies this scope on desktop and mobile, including when opening a note directly.

## Features

- **Workflow navigation**: Setup and Companions stay primary; reference sections
  are collapsible and the parser/encoders sit under Utilities.
- **Kali setup**: copyable installation and verification commands with fixed
  `/home/kali/tools/...` destinations for the app, third-party tools, payloads
  and wordlists. Manual check-offs are saved locally.
- **Search** (`/` or `Ctrl K`): full text over every heading, paragraph and
  command, with typo tolerance. A result opens at the exact heading.
- **Machine profiles**: one renamable tab per machine — MS01, MS02, DC01,
  Box 1-3 — with only IP address, Domain, Username and Password in the editor.
  **My IP** and **My port** are shared across every box. DC01's IP address
  automatically supplies `DC`. Make a profile default to fill every displayed
  and copied command. Browsing another tab leaves the working profile unchanged.
- **Scan parser**: paste nmap normal, grepable or XML output to extract ports,
  load the address and ports into the current profile, and get note suggestions
  from your own rules.
- **Companions**: phased YAML decision paths with copyable commands drawn from
  note headings, contextual methodology, outcome-based transitions and per-step
  findings. Imported target ports recommend relevant services without selecting
  them automatically. Paths, completion, findings and service choices are saved
  separately for each default profile and target address.
- **Encoders**: Base64, PowerShell `-EncodedCommand`, URL, hex, HTML entities
  and ROT13, all offline.
- **Checklists**: Markdown task lists become checkboxes with saved progress.

Everything personal (profile values, imported ports, checks, companion sessions,
findings, pins) is stored in this browser's localStorage only.

When hosted, visitors keep independent settings in their own browser profiles
for that site address. Personal values are not sent to the hosting server or
stored in cookies. Existing variable values and the selected target are preserved
in Box 1 when upgrading.

## Use

```bash
npm ci
npm run dev        # http://localhost:4320
npm run build      # writes dist/index.html, a single self-contained file
```

Open `dist/index.html` directly in a browser, no server needed. Keyboard
shortcuts are listed under `?`.

## Write notes

See [CONTRIBUTING.md](CONTRIBUTING.md) for the complete authoring guide:

- Pages: `content/<section>/<page>.md`, with optional `title`, `order`, `tags`
  frontmatter. Section titles and order go in `content/<section>/_meta.yaml`.
- Suggestion rules: `content/_rules.yaml`.
- Companions: `content/_playbooks/*.yaml`.
- Setup catalog: `content/_setup.yaml`.

The section name `tools` and folders starting with `_` are reserved.

## Develop

Use Node.js 24. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and review steps,
and [the architecture map](docs/architecture.md) for where to make changes.

```bash
npm run format
npm run format:check
npm run lint
npm run typecheck
npm test           # unit tests, plus checks that note links, rules, setup and
                   # companions point at valid content and commands
npm run test:e2e   # Playwright: Chromium, Firefox, WebKit and mobile
npm run verify     # all of the above plus a build
```

The end-to-end suite builds against `e2e/fixtures/content`, so editing your
notes never breaks it.

## Contribute

Submit changes through a pull request to the default branch. Every file is
owned by `@platypus27`, whose approval is required before merging. New reviewable
commits dismiss prior approvals, and review conversations must be resolved.
Direct pushes, force pushes and deletion of the default branch are blocked,
with no bypass actors configured.

GitHub does not allow authors to approve their own pull requests. The sole
code owner's own pull requests therefore cannot satisfy this review requirement.

The ruleset definition is in `.github/rulesets/default-branch.json`. It is applied
through GitHub's repository settings; editing the file alone does not change
the live ruleset.
