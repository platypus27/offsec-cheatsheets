---
title: Delegation paths
order: 7
tags: [ad, delegation, impacket, rubeus, kerberos]
---

## Discover delegation

Run on **Kali** with a domain account. Identify the controlled principal,
delegation type, allowed SPNs, target host and protected-account restrictions.

```bash
impacket-findDelegation -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}'
```

Verify returned attributes directly; an edge does not prove service reachability,
key access or a forwardable ticket. [findDelegation](https://github.com/fortra/impacket/blob/master/examples/findDelegation.py).

## Constrained delegation

On **Kali**, use a controlled delegating service account with confirmed
`msDS-AllowedToDelegateTo` and protocol-transition rights. `SPN` must be one of
the permitted services. Sensitive accounts may be ineligible for delegation.

```bash
impacket-getST -dc-ip '{{DC}}' -spn '{{SPN}}' -impersonate '{{TARGET_USER}}' '{{DOMAIN}}/{{SERVICE_USER}}:{{SERVICE_PASS}}'
```

For Kerberos-only constrained delegation, an appropriate forwardable evidence
service ticket is required; do not assume protocol transition works:

```bash
impacket-getST -dc-ip '{{DC}}' -spn '{{SPN}}' -impersonate '{{TARGET_USER}}' -additional-ticket '{{EVIDENCE_CCACHE}}' '{{DOMAIN}}/{{SERVICE_USER}}:{{SERVICE_PASS}}'
```

Use the actual output filename as `KRB5CCNAME`, then verify the requested service
through [ticket reuse](active-directory/tickets#pass-the-ticket-from-kali).
`KDC_ERR_BADOPTION` can mean delegation or ticket-forwardability prerequisites
are missing. [getST supported flows](https://github.com/fortra/impacket/blob/master/examples/getST.py).

## Unconstrained delegation

On the **controlled Windows host**, confirm unconstrained delegation and the
ability to inspect the relevant logon sessions. A useful inbound delegated TGT
must actually arrive; Protected Users and sensitive accounts can prevent this.
Use the [reviewed build and staging procedure](active-directory/tool-preparation)
before transferring Rubeus to this host.

```powershell
.\Rubeus.exe triage
.\Rubeus.exe monitor /interval:5 /nowrap
```

Inspect the captured principal and ticket before [importing it](active-directory/tickets#windows-ticket-inspection-and-reuse).
An NTLM authentication event is not a delegated Kerberos TGT. Stop the monitor
when the controlled test ends, purge lab-session tickets and remove staged files
after retaining evidence. [Rubeus monitor](https://github.com/GhostPack/Rubeus), [protected accounts](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/how-to-configure-protected-accounts).

## Resource-based delegation

Follow [RBCD prerequisites, mutation and cleanup](active-directory/attack-paths#resource-based-constrained-delegation).
Record the original `msDS-AllowedToActOnBehalfOfOtherIdentity` security descriptor
and whether the controlled computer was pre-existing. Remove only your added ACE
and a lab-created computer after use; do not clear unrelated delegation entries.
