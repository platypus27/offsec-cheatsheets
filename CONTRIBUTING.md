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
2. For notes, follow [the authoring guide](content/start/authoring.md). Current
   content covers OSCP (PEN-200) only. Keep headings, rules and playbooks in sync.
3. For code, use [the architecture map](docs/architecture.md) to find the module
   responsible for the behavior. Keep parsing and domain logic independent of React.
4. For a behavior change, write a failing test at the public interface first.
   Reproduce bugs through the rendered app when possible. For a refactor, preserve
   the existing behavioral tests and public interfaces.
5. Run the checks, commit as `<action>: <description>`, and open a pull request.
   Do not add co-author lines or commit credentials, personal browser data, or build output.

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
the real notes, rules and playbooks. Browser journeys in `e2e/` use fixed fixtures,
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
