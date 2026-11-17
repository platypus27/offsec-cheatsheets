# OSCP field manual expansion

Source request: review the two supplied Notion roots on 2026-11-18 and use their
content to substantially expand the existing application. Preserve OSCP/PEN-200
scope and the existing offline, single-file, local-browser architecture.

Sources:

- OSCP Field Manual: `413bbf9f-0e74-8189-b961-d23104ab7509`.
- OSCP OffSec Certified Professional: `335bbf9f-0e74-8075-82a0-c363ed3c1275`.

## Outcomes

1. Finish the AD completeness spec and its intentionally failing coverage check.
2. Provide a task-oriented field-manual index covering the supplied workflow:
   setup, discovery, services, web, exploit assessment, shells/transfers, passwords,
   credential hunting, Linux/Windows escalation, AD, pivoting, evidence and labs.
3. Add command lookup with combinable text, tool, service and phase filters.
   Filters are bookmarkable and preserve browser back/forward behavior. Commands,
   prerequisites, links, variable inputs and copy behavior reuse the authored note
   heading, including its persisted task identity. Empty results offer recovery.
4. Expand reference content with original, concise prose grounded in the supplied
   notes and primary tool documentation. Retain source links, prerequisites,
   execution location, expected interpretation and cleanup for changing operations.
5. Provide troubleshooting by symptom, Windows/Linux path references, a coverage
   map and a locally saved lab notebook per machine profile and target address.
   The notebook records status, entry, privilege path, evidence and next action;
   its Markdown export contains the selected target only.
6. Make these entry points visible from home and navigation, on desktop and mobile.
7. Preserve existing personal data, profile isolation, heading routes, search and
   single-file offline use. Do not add runtime fetches or dependencies.

## Validation and review

Use the already approved boundaries from `ad-reference-completeness.md`: rendered
browser workflows and parsed real content. Proceed in RED/GREEN vertical slices.
Browser fixtures exercise filters, source navigation, contextual command inputs,
target isolation, notebook persistence/export, mobile layout and accessibility.
Real-content checks validate every catalogue reference, command and phase link.
Run the full repository verification and inspect real desktop/mobile content and
the offline build. Commands are source-reviewed, not executed against AD targets.

Review the cumulative work against the previously agreed `52d7d3e` baseline using
separate Standards and Spec reviewers, with both this spec and the AD spec.
