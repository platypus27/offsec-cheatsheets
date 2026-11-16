# AD reference completeness and usability

Accepted scope: the user's 2026-11-16 request to implement the assessment and make
the cheatsheet as complete as possible within its established OSCP/PEN-200 scope.
Review baseline: `52d7d3e`. Agreed test boundaries: rendered browser workflows and
the parsed real-content interface.

## User outcomes

- Outcome labels retain their complete text; malformed option fields are rejected.
- Companion navigation brings the current step into view and keyboard focus.
- Basic machine profiles remain simple. Command-specific inputs fill advanced
  placeholders without overwriting another profile or silently changing targets.
- Commands retain their prerequisite and expected-result prose. Alternative
  operations have separate copy blocks. Selected service sections can collapse.
- Long reference pages offer a mobile heading index. Findings and outcome
  navigation remain easy to reach. Returning users can resume their current work.
- Supplied credentials have a direct AD entry path.
- AD coverage includes native Windows/.NET/PowerView enumeration, SharpHound and
  graph interpretation, ticket acquisition/conversion/reuse/forgery, DCOM,
  constrained and unconstrained delegation, ACL/group operations, relay,
  certificate workflows, troubleshooting and cleanup.
- Correct known command defects, complete ESC7, and resolve verified cracking and
  time-sync TODOs. Integrate new headings into the companion and setup catalog.
- An AD task index documents coverage and evidence. Commands cite primary sources;
  source inspection, application tests and live AD lab execution remain distinct.

## Validation

Reproduce UI bugs through the rendered application, then use one failing test and
implementation slice at a time. Exercise command display/copy, context isolation,
heading navigation, step navigation, service collapse and retained note context.
Validate real-content references and companion reachability. Run formatting,
lint, types, unit/content tests, build and all supported browser projects. Inspect
real content on desktop/mobile and the offline build. Review Standards and Spec
independently against the fixed baseline. No deployment or live-target testing is
implied by this change.
