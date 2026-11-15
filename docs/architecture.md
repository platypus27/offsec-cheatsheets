# Architecture map

The app has three layers: authored Markdown/YAML, pure parsing and domain logic,
and a React interface with local browser state. Content is bundled at build time.
There is no backend or runtime content fetch.

## Where to make changes

| Change                                 | Start here                                                                      | Existing checks                                               |
| -------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Notes and section order                | `content/`, `CONTRIBUTING.md`                                                   | `src/content.check.test.ts`                                   |
| Kali setup catalog and page            | `content/_setup.yaml`, `src/lib/setup.ts`, `src/pages/SetupPage.tsx`            | Setup unit and browser journeys                               |
| Searchable headings and task keys      | `src/lib/content.ts`                                                            | `src/lib/content.test.ts`, `src/components/Markdown.test.tsx` |
| Content file discovery                 | `src/content-source.ts`, `vite.config.ts`                                       | Content check and offline browser test                        |
| Link resolution and heading URLs       | `src/lib/links.ts`, `src/lib/refs.ts`, `src/lib/linkcheck.ts`                   | Link check and navigation browser journeys                    |
| Port-to-note suggestions               | `src/lib/rules.ts`, `src/components/Suggestions.tsx`                            | `src/lib/rules.test.ts`                                       |
| Companion parsing and traversal        | `src/lib/playbooks.ts`, `src/pages/tools/PlaybooksPage.tsx`                     | Companion unit tests and browser journeys                     |
| Companion sessions and recommendations | `src/lib/companions.ts`, `src/state.tsx`, `src/components/PlaybookServices.tsx` | Session unit tests and target-switching browser journeys      |
| Scan parsing and profile port import   | `src/lib/nmap.ts`, `src/state.tsx`                                              | Matching unit tests and scan-import browser journey           |
| Variables and command display/copy     | `src/lib/variables.ts`, `src/lib/highlight.ts`, `src/components/CodeBlock.tsx`  | Variable and code-block tests, copy browser journey           |
| Personal state and persistence         | `src/state.tsx`, `src/lib/storage.ts`                                           | Storage tests and persistence browser journeys                |
| Machine profile and variable form      | `src/components/VariablesPanel.tsx`, `src/components/ProfileVariables.tsx`      | Profile and accessibility browser journeys                    |
| App shell, routes and shortcuts        | `src/components/Layout.tsx`, `src/App.tsx`, `src/hooks.ts`                      | Navigation, keyboard and accessibility browser journeys       |

## Keep responsibilities clear

- `src/lib/guards.ts` holds runtime shape checks shared by parsed YAML and stored
  JSON. It does not import React, storage, or the DOM.
- Parsing, reference checks, search, encoders and legacy migration helpers in
  `src/lib/` return data. Keep browser effects in `storage.ts`, hooks, or the UI.
- `src/state.tsx` owns shared personal state and derives effective variables.
  `ProfileVariables` receives the current profile and an update callback.
- `src/lib/profiles.ts` defines the version 3 profile format and validates restored
  data. Per-profile variables, imported ports, shared My IP/My port values and the
  default selection share one `variable-profiles` entry. Versions 1 and 2 migrate
  forward; linked legacy target values and ports fold into their profiles. Old
  `variables`, `active-target` and `targets` entries seed Box 1 only when no valid
  profile entry exists and remain as untouched legacy data. DC01's IP address
  supplies `DC` for every command.
- `src/content-source.ts` is the build-time file adapter. `buildContent` and
  `buildTools` accept source strings, so their logic can be exercised without Vite.
- Companion `commands` and service commands reference note headings. The content
  parser retains each fenced block's language; `PlaybookCommands` resolves those
  blocks and reuses `CodeBlock` for display and copy. `PlaybookServices` uses the
  shared check state, scoped by companion, default profile and effective host.
  Service matchers only recommend confirmed open ports. Companion validation
  rejects missing phases, broken references and headings without commands.
- `src/lib/companions.ts` validates the versioned `companion-sessions` entry.
  Paths, completed nodes and findings are keyed by companion, profile and host;
  an explicit URL path remains bookmarkable and browser history stays authoritative.

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
- **Variable precedence:** shared values (LHOST/LPORT) apply to every profile;
  the default profile supplies its own values, and DC01's IP address supplies DC.
  Editing another profile does not change the default. Display and copy resolve
  values consistently. Substitution is plain text, not shell quoting or escaping.
- **Untrusted text:** keep raw Markdown HTML disabled and escape variable values
  before inserting highlighted HTML. Treat pasted scans and persisted JSON as
  external input.
- **Content validation:** a renamed page or heading needs updates to every note
  link, suggestion and companion reference. `npm test` checks the real content
  and setup catalog.
- **Current scope:** the interface and content identify the reference as OSCP only.
  Additional certifications need an explicit product and content decision.

See [CONTRIBUTING.md](../CONTRIBUTING.md) for setup, checks and review policy.
