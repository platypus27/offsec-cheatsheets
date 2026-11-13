# Content validation

Checked 2026-11-14 against starting commit ff8b379. Content changes end at eeeeca2; no application code or dependency changes.

## Research workers

Orca Run: run_8915bae803d8. Both workers delivered successful worker_done reports and follow-up corrections.

| Requested model | Configured alias | Observed evidence |
| --- | --- | --- |
| K2.8 Preview | kimi-code/kimi-for-coding | Orca-managed terminal displayed K2.8 Preview before dispatch; provider alias retained |
| K3.1 Pro | kimi-code/k3.1-pro | Orca-managed terminal displayed K3.1 Pro; session log recorded model=k3.1-pro |

Initial research dispatches: ctx_3ea271ed127e and ctx_405a94b7113c. Research files identify source dates, licenses and gaps. No live-target commands were executed.

## Automated checks

- npm test: 15 files, 83 tests passed, including real-content links, rules and playbooks.
- npm run lint: passed.
- npm run build: passed, including both TypeScript checks; generated dist/index.html.
- git diff --check: passed.
- All authored Bash fences passed bash -n after fixture substitution; commands were not executed.
- Content audit: required frontmatter, tagged fences, supported placeholders, nonempty headings and no em dash.
- Navigation audit: all 86 subject headings have an inbound note, rule or playbook reference; 19 subject pages, 14 rules and 8 playbooks.

## Rendered checks

- Orca browser: desktop notes, heading search, AD playbook transitions and links, and parser suggestions from synthetic Nmap output.
- Direct file opening: all 20 pages, including the unchanged authoring guide, rendered with the expected titles and 94 headings.
- At 390px width, all pages had no document-level horizontal overflow; representative desktop and mobile screenshots were inspected.
- File build loaded no HTTP(S) resource requests and produced no console entries during the inspected session.
- Long AD decision breadcrumbs were reproduced at mobile width and shortened in content.

These checks validate the reference and app rendering. Tool commands were checked against sources, not exercised against lab services. The existing fixture-based Playwright suite was not rerun for this content-only change.

## Review

Parallel Standards and Spec review used ff8b379 as the fixed baseline. Initial Standards suggestions were a separate SYSVOL search heading and inbound links for access commands; both were resolved. Spec found a version-dependent BloodHound All-collection claim; it now requires checking the installed version's methods. Both reviewers verified the follow-up diff and reported zero remaining findings.
