# Field manual validation and review - 2026-11-18

Implementation reviewed and tested through `bf82eb42ede08df75320712a6d17e8315a99d324`.
Review baseline: `52d7d3e`. The subsequent documentation commit records these
results without changing the application.

## Delivered application

- 55 reference pages and 213 command groups.
- 55 tool filters, 36 service contexts and 10 guided companions.
- Task index, symptom troubleshooting, Windows/Linux paths and source coverage.
- URL-backed command filters with source context, advanced values and exact-note links.
- Lab notebook isolated by profile and target address, with selected-target Markdown export.
- Expanded AD enumeration, tickets, delegation, relay, ACL, certificate and credential workflows.
- One self-contained offline HTML build with no new runtime dependency.

The [source review](notion-field-manual.md),
[field manual spec](../specs/notion-field-manual.md) and
[AD spec](../specs/ad-reference-completeness.md) define scope and evidence limits.

## Standards

Independent review initially reported no hard violations and one judgement
finding: incomplete service metadata hid the domain/DNS and Hydra/HTTP groups
under combined filters. The fix corrected those labels and audited related
AD, password, SQL and file-transfer contexts. Parsed-catalogue regressions cover
the reported examples.

Rechecks at `472fec2` and `bf82eb4` found no unresolved Standards findings. The
reviewer independently ran the five field-manual content tests. The final scroll
and test-budget changes were reviewed by source inspection, not by an independent
full browser run.

**Standards: 0 hard violations, 0 unresolved judgement findings.**

## Spec

Independent review found a concrete password-companion routing defect and a
Rubeus setup coverage gap. Extracted John input now stays on a John continuation;
the generic offline branch requires a verified cracker/input format. The Rubeus
procedure now pins source, documents the actual framework requirement, builds on
a Windows operator VM, verifies help/hash output and stages the returned binary
at the fixed Kali path.

The coordinator additionally reproduced missing CA-host flags in all six rendered
ESC7 management commands and checked Certipy's target-resolution source. Each
command now identifies `CA_HOST` explicitly. The Spec reviewer confirmed those
corrections and independently ran the five field-manual content tests.

The `bf82eb4` recheck found no new Spec defects. Pathname scroll reset preserves
the existing note-heading and companion-step effects and query-only navigation.

**Spec: 0 unresolved defects or coverage findings within the accepted reference scope.**

## Coordinator validation

`npm run verify` completed with **exit 0**:

| Check | Result |
| --- | --- |
| Prettier | Passed |
| ESLint | Passed, zero warnings |
| TypeScript, application and Vite configuration | Passed |
| Vitest | 21 files, 113 tests passed |
| Production single-file build | Passed |
| Playwright | 172 passed, 8 explicit skips, zero failures |
| Browser projects | Chromium, Firefox, WebKit, mobile Chromium |

The browser journeys cover combined filters, URL persistence, empty-result
recovery, full-note navigation, excerpt checklist identity with duplicate labels,
advanced value display/copy and profile isolation, notebook save/reload/export,
profile and address isolation, resume behavior, mobile navigation and layout,
heading routes, selected-service accessibility and existing utility workflows.

RED/GREEN evidence included the checkpoint's missing AD workflow test, absent
explorer/notebook routes, lost page-introduction context, unknown catalogue fields,
metadata omissions, John routing, Rubeus staging, missing CA targets and inherited
page scroll. The full checks exposed and led to corrections for a saved-resume
race and skipped service heading level. Existing highlighting behavior and its
keystroke reuse check remain covered after resolving the compiler lint finding.

A WebKit transition assertion was made to wait for the destination note's H1,
retaining its heading-position and task-persistence checks. Local browser workers
now match CI at two. The existing accessibility journey performs five full Axe
scans and now has a scoped 60-second budget; no scans or assertions were removed.
The earlier 30-second scan timeout coincided with host load above 40 on 16 CPUs
and heavy swapping. The final complete run passed in 3.0 minutes.

Raw final run output: `/tmp/offsec-field-release-verify.log`;
exit receipt: `/tmp/offsec-field-release-verify.exit`.

## Real-content and offline inspection

Orca browser inspection used the actual reference on desktop and at 320px,
including an expanded nine-block ESC7 group. The document fit the 320px viewport
without horizontal page overflow. A real navigation from a long scrolled page
reproduced the notebook's hidden heading before the pathname reset.

The final `dist/index.html` was reloaded directly from disk. The command explorer
rendered its filtered groups and all six ESC7 CA commands included explicit
targets. Resource inspection recorded zero HTTP requests. Navigating to the
notebook returned to scroll position zero, and home displayed 55 pages, 213 groups,
55 tools and 10 workflows.

Artifact SHA-256:

```text
224b88bf56b6c108d649991784adac95e1044f9bb08e45f013228c2f2297a0ee
```

## Explicit limits

The eight skips remain the documented platform cases: three desktop-only skips
of the mobile drawer test, mobile skips for hardware shortcuts and the desktop
outline, WebKit's automated file-storage case, and two historical Firefox
service-card Axe crashes. The two Firefox service-card scans remain unverified;
interaction/layout checks and the other browser scans run.

No AD commands, exploit workflows or setup installers were run against lab
targets. Rubeus compilation was documented and source-inspected, not executed in
a Windows compiler environment here. Source inspection and application validation
do not establish live-target compatibility. The in-app coverage page retains the
original source's study gaps and contextual material instead of claiming all
imported recipes are correct or exam-permitted.

The changes are committed locally. No hosted deployment or live-service acceptance
is implied by this result.
