# Maintaining OffSec Cheatsheets

Use Node.js 24, matching `package.json`. Install the locked dependencies and
browser binaries once:

```bash
npm ci
npx playwright install --with-deps chromium firefox webkit
npm run dev
```

## Make a focused change

1. Start a branch from the default branch.
2. For content, follow the authoring guide below. Current content covers OSCP
   (PEN-200) only. Keep headings, rules, setup commands and companions in sync.
3. For code, use [the architecture map](docs/architecture.md) to find the module
   responsible for the behavior. Keep parsing and domain logic independent of React.
4. For a behavior change, write a failing test at the public interface first.
   Reproduce bugs through the rendered app when possible. For a refactor, preserve
   the existing behavioral tests and public interfaces.
5. Run the checks, commit as `<action>: <description>`, and open a pull request.
   Do not add co-author lines or commit credentials, personal browser data, or build output.

## Author content

Pages are `content/<section>/<page>.md`, with optional `title`, `order` and
`tags` frontmatter. Section titles and order belong in
`content/<section>/_meta.yaml`. Every `##` and `###` heading is a search and
link target; keep one technique per heading. Use `[text](section/page)` or
`[text](section/page#heading-id)` for internal links. Raw HTML is disabled.

Use `{{NAME}}` placeholders in fenced commands. The default machine profile,
DC01-derived controller address and shared My IP value fill displayed and copied
commands. The profile editor intentionally exposes only IP address,
Domain, Username and Password; advanced placeholders may remain in commands.
Use `{{NAME|sh}}` where a POSIX shell reads a literal argument, for example a path
passed to Bash. Leave the placeholder unquoted in the source. The renderer adds
shell quotes so spaces and apostrophes stay part of the argument.
Supported languages include `bash`, `powershell`, `cmd`, `python`, `sql`,
`http`, `php`, `c`, `csharp`, `json` and `yaml`. Markdown task lists retain
saved check state, so renaming a task changes its storage identity.

### Field manual and command catalogue

Keep `content/field-guide/start.md` as the task index and
`content/field-guide/coverage.md` as the source/coverage ledger. Adapt supplied
examples into original concise prose with explicit host roles, prerequisites,
result interpretation and cleanup. Source inspection and application checks do
not establish live-target validation. Retain `TODO: verify` for unresolved details.

`content/_recipes.yaml` indexes heading references with `tools`, `services` and
`phase` metadata. Each entry must resolve to a heading containing a fenced command.
Unknown fields, duplicate references and broken/commandless headings fail checks.
Do not duplicate the commands in the catalogue. Review labels against the actual
commands so combined filters are useful. A recipe is a command group, not a count
of unique command lines or independently verified techniques.

Companions and explorer groups render the note's page introduction and heading
excerpt, preserving source context and checklist identity. Keep page introductions
short and place technique-specific prerequisites directly under their heading.
Advanced command inputs are saved with the default profile. Plain `{{NAME}}`
placeholders substitute literally. Long notes expose a mobile heading index.

The lab notebook stores manual status and notes per profile and trimmed target
address. Its Markdown export includes the selected target's notebook fields;
screenshots and original output files stay on disk. Companion findings are visible
separately and are not silently included in exports.

`content/_rules.yaml` maps open ports, service names and versions to note
headings for the scan parser. Folders starting with `_` and
the section name `tools` are reserved.

### Companions

Each `content/_playbooks/*.yaml` file defines `title`, `description`, `start`
and `nodes`. Every node needs `phase` and `prompt`; `body`, `why`, `lookFor`,
`record`, `links`, `commands`, `services` and `options` are optional. Options
have a `label` and a reachable `next` node. Loops are allowed, orphan nodes are
not. Contextual methodology belongs in the node help, not a separate checklist.

Commands reference note headings instead of duplicating command text:

```yaml
phase: Enumeration
prompt: Enumerate confirmed SMB shares.
why: Readable shares can expose credentials and configuration.
commands: [active-directory/smb-enumeration#smb-share-permissions]
options:
  - { label: Share evidence recorded, next: leads }
```

A service needs a unique `id`, `title` and command references. Optional
`match: { ports: [445], services: [microsoft-ds] }` recommends it when the
current machine profile has a matching imported open port. Recommendations never auto-select the
service. Service selections and companion sessions are isolated by playbook,
profile and effective host.

### Setup catalog

`content/_setup.yaml` contains sections and items. Each item needs a unique
`id`, `title`, `command`, `verify` and `destination`. Destinations must be
`PATH` or absolute paths below `/home/kali/tools`; third-party projects use
`/home/kali/tools/<project>`, target executables use `tools/binaries`, and
wordlists use `tools/wordlists`. Keep commands repeatable and update every note
that relies on a changed path. Setup check-offs are manual: the browser cannot
install or detect host tools.

## Run the checks

```bash
npm run format        # format code and development files
npm run verify        # formatting, lint, unit/content tests, typecheck, build, browsers
```

For a focused feedback loop:

```bash
npm run test:watch
npm run test:e2e -- --project=chromium
```

Prettier preserves authored notes, research files and E2E fixture files by excluding
them in `.prettierignore`. `package-lock.json` is updated by npm. Do not hand-edit
generated files or `CHANGELOG.md` files.

Unit tests sit beside their modules in `src/`. `src/content.check.test.ts` validates
the real notes, rules, setup catalog and companions. Browser journeys in `e2e/` use fixed fixtures,
so note edits do not alter their expectations. The browser suite covers Chromium,
Firefox, WebKit and a mobile viewport. Its platform-specific skips are explicit in
the tests; they are not failures.

Firefox 159 (Playwright 1.65.0, browser build 1572) exits with SIGSEGV when Axe
4.14.0 builds its DOM context for the playbook service step. The two new light/dark
service-card accessibility scans explicitly skip Firefox. Selection, persistence,
copy and 320px layout checks still run in Firefox; full service-card Axe scans run
in Chromium, WebKit and mobile Chromium. These two Firefox accessibility cases
remain unverified. TODO: retry them when upgrading Playwright or Firefox.

## Review and automate

The `Verify` GitHub Actions workflow runs the same `npm run verify` command on pull
requests and default-branch pushes. It retains browser traces and screenshots on
failure. The workflow reads the Node version from `package.json` and pins actions
to reviewed commit hashes. When upgrading an action, update its hash and version comment together.

Review dependency updates in focused pull requests. Use `npm install` to update
the lockfile, run `npm run verify`, and check `dist/index.html` directly from disk
before accepting changes to routing, Markdown rendering, highlighting or the build.

Every file requires `@platypus27`'s code owner review. The default-branch ruleset
has no bypass actors; GitHub does not allow authors to approve their own pull
requests. See [the repository policy](README.md#contribute).
