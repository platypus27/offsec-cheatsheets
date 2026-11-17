---
title: Attack flow and lead discipline
order: 1
tags: [methodology, checklist, workflow, lab, evidence]
---

Adapted from the supplied [attack flow](https://app.notion.com/413bbf9f0e74816e8e8dd7eea6544cd7)
and [lab tracker](https://app.notion.com/413bbf9f0e7481208047d17820a2cc0c).

## Prepare a session

- [ ] Confirm the target and network scope.
- [ ] Select the machine profile and verify IP, domain and current identity.
- [ ] Create a per-target directory for scans, files, exploits and evidence.
- [ ] Verify VPN/route, callbacks, tool paths and a working listener.
- [ ] Review the last next action before repeating earlier scans.

## Move through the attack

1. Build a service and hostname map, including UDP when the evidence warrants it.
2. Enumerate each confirmed service with the access currently available.
3. Turn one concrete finding into a hypothesis with a prerequisite and success test.
4. Establish a foothold, verify identity and enumerate again from that position.
5. Prove the local or directory permission path before using an escalation variant.
6. Verify the resulting identity, capture evidence and test only supported movement.
7. Record the chain, failures and cleanup before switching machines.

Companions provide decisions and commands for these stages. A branch is a
conditional route, not a promise that every target follows the same sequence.

## Compare leads

| Lead | Evidence to gather before acting |
| --- | --- |
| Product version | Exact component, deployment, patch/backport and advisory prerequisites |
| Readable configuration | Consumer application, account authority, freshness and intended service |
| Writable file | Actual ACL, privileged consumer, trigger, interpreter and effective identity |
| SUID or capability | Exact binary, mount options, privilege preservation and relevant operation |
| AD graph edge | Source/target objects, effective right, inheritance, freshness and reachable service |
| Internal network | Live tunnel session, destination route, DNS and callback direction |

Keep an attempt ledger: hypothesis, command/request, result, disproved condition
and next check. An error without its context becomes expensive to reproduce.

## Recognize a chain without assuming it

- A web configuration may expose a database credential; that does not establish
  OS execution or password reuse.
- Local administrator access may expose a domain credential; that does not imply
  replication rights.
- A writable group or object may unlock another identity; refresh sessions and
  verify the new permission before continuing.
- A pivot may reveal another service; enumerate it from that network position
  instead of treating it as the same host.

## Close a session

- [ ] Verify the status and evidence for every changed target.
- [ ] Save exact commands and exploit modifications in reproduction order.
- [ ] Record created accounts, services, files, routes, tickets and directory changes.
- [ ] Restore the specific state changed by the exercise where required.
- [ ] Write one evidence-backed next action in Lab notebook.
- [ ] Export the selected target's notes and verify the exported text.
