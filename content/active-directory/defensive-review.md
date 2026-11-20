---
title: Active Directory control review
order: 12
tags: [active directory, bloodhound, graph, audit, kerberos, ntlm, certificate, controls]
---

Use directory graph data and administrative records to explain why a relationship
exists, what sensitive object it reaches, and who can remediate it.

## Review BloodHound data quality

In Explore, locate the known object by a domain-qualified identifier and confirm
its type. Select an edge to read its direction and meaning. Record the collection
scope and timestamp. A path can contain stale relationships or assumptions about
reachability. A missing path can reflect uncollected data. Verify effective
membership and permissions with the directory owner before making a change.
Recollect the affected scope afterward and compare the result.

## Review authentication and delegation

| Area | What the owner should verify |
| --- | --- |
| Privileged membership | Intended nested membership, delegation of membership changes and approval records |
| Service identities | Business owner, required SPNs, privilege scope, rotation and managed-account options |
| Kerberos delegation | Effective delegation type and destinations, with sensitive accounts protected according to policy |
| NTLM and directory transport | Legacy dependencies, SMB signing, LDAP signing and channel binding under the effective policy |
| Certificate enrollment | CA role holders, template enrollment and modification rights, and issuance approval requirements |
| Local admin access | Intended host scope, unique managed local passwords and recovery ownership |

Start with a narrow review and stage changes against known applications. Record
exceptions and their expiry. Compare domain controller and service-side logs with
policy or directory changes during the same window. Replication, log retention
and collection permissions affect what is visible.

See [BloodHound Explore](https://bloodhound.specterops.io/analyze-data/explore/search)
and [Microsoft guidance for securing Active Directory](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/best-practices-for-securing-active-directory).
