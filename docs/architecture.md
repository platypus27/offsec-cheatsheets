# Architecture map

The app has three layers: authored Markdown/YAML, pure parsing and domain logic,
and a React interface with local browser state. Content is bundled at build time.
There is no backend or runtime content fetch.

## Where to make changes

| Change                                 | Start here                                                                                                | Existing checks                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Notes and section order                | `content/`, `content/start/authoring.md`                                                                  | `src/content.check.test.ts`                                   |
| Searchable headings and task keys      | `src/lib/content.ts`                                                                                      | `src/lib/content.test.ts`, `src/components/Markdown.test.tsx` |
| Content file discovery                 | `src/content-source.ts`, `vite.config.ts`                                                                 | Content check and offline browser test                        |
| Link resolution and heading URLs       | `src/lib/links.ts`, `src/lib/refs.ts`, `src/lib/linkcheck.ts`                                             | Link check and navigation browser journeys                    |
| Port-to-note suggestions               | `src/lib/rules.ts`, `src/components/Suggestions.tsx`                                                      | `src/lib/rules.test.ts`                                       |
| Playbook parsing and traversal         | `src/lib/playbooks.ts`, `src/pages/tools/PlaybooksPage.tsx`                                               | Playbook unit tests and browser journey                       |
| Scan parsing and target merging        | `src/lib/nmap.ts`, `src/lib/targets.ts`                                                                   | Matching unit tests and scan-import browser journey           |
| Variables and command display/copy     | `src/lib/variables.ts`, `src/lib/highlight.ts`, `src/components/CodeBlock.tsx`                            | Variable and code-block tests, copy browser journey           |
| Personal state and persistence         | `src/state.tsx`, `src/lib/storage.ts`                                                                     | Storage tests and persistence browser journeys                |
| Target list, details and variable form | `src/pages/tools/TargetsPage.tsx`, `src/pages/tools/TargetPage.tsx`, `src/components/TargetVariables.tsx` | Target browser journeys                                       |
| App shell, routes and shortcuts        | `src/components/Layout.tsx`, `src/App.tsx`, `src/hooks.ts`                                                | Navigation, keyboard and accessibility browser journeys       |

## Keep responsibilities clear

- `src/lib/guards.ts` holds runtime shape checks shared by parsed YAML and stored
  JSON. It does not import React, storage, or the DOM.
- Parsing, reference checks, search, encoders and target transformations in
  `src/lib/` return data. Keep browser effects in `storage.ts`, hooks, or the UI.
- `src/state.tsx` owns shared personal state and derives effective variables.
  Editors such as `TargetVariables` receive values and an update callback instead
  of looking up their parent record again.
- `src/content-source.ts` is the build-time file adapter. `buildContent` and
  `buildTools` accept source strings, so their logic can be exercised without Vite.

## Invariants to preserve

- **Offline build:** `vite-plugin-singlefile` inlines scripts, styles and fonts into
  `dist/index.html`. Keep the hash router and avoid runtime network dependencies.
  A future static host serves this same build.
- **Heading identity:** Markdown parsing and rendering use compatible GitHub slug
  generation. Search results, note links and outlines must reach the same DOM ids.
  Use `pageHref` to encode heading destinations for the hash router.
- **Saved progress:** task keys include page slug, label and occurrence. Renaming
  those changes the saved identity. Preserve storage namespace and keys unless a
  migration is supplied.
- **Variable precedence:** target address supplies `RHOST`; target variables
  override globals. Display and copy must resolve values consistently. Substitution
  is plain text, so it does not provide shell quoting or escaping.
- **Untrusted text:** keep raw Markdown HTML disabled and escape variable values
  before inserting highlighted HTML. Treat pasted scans and persisted JSON as
  external input.
- **Content validation:** a renamed page or heading needs updates to every note
  link, suggestion and playbook reference. `npm test` checks the real content.
- **Current scope:** the interface and content identify the reference as OSCP only.
  Additional certifications need an explicit product and content decision.

See [CONTRIBUTING.md](../CONTRIBUTING.md) for setup, checks and review policy.
