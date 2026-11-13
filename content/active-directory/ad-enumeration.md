---
title: AD enumeration
order: 1
tags: [ad, ldap, smb, netexec, bloodhound]
---

## Domain overview

```bash
nxc smb {{RHOST}}
```

Record hostname, domain label and signing status. The label may be NetBIOS; it does not prove this host is a DC. [Source](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-hosts).

## DNS SRV records

Set DOMAIN to the DNS domain and DC to its DNS server address.

```bash
dig @{{DC}} _ldap._tcp.dc._msdcs.{{DOMAIN}} SRV +short
```

Match returned hostnames to reachable DC addresses. [Microsoft discovery record](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/7fcdce70-5205-44d6-9c3a-260e616a2f04), [dig syntax](https://bind9.readthedocs.io/en/v9.18.33/manpages.html).

## Domain users

Requires a valid domain account.

```bash
nxc ldap {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --users
```

[Source](https://www.netexec.wiki/ldap-protocol/enumerate-users).

## Domain groups

```bash
nxc ldap {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --groups
```

Append a discovered group name to list its members. Current documentation uses LDAP for this option. [Source](https://www.netexec.wiki/ldap-protocol/enumerate-group-members).

## Password policy

```bash
nxc smb {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --pass-pol
nxc ldap {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --pso
```

- [ ] Record lockout threshold and observation window before repeated logins.
- [ ] Check fine-grained policy applicability; the domain default may differ from an account's effective policy.

[Domain policy](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-domain-password-policy-1), [fine-grained PSOs](https://www.netexec.wiki/ldap-protocol/dump-pso).

## BloodHound CE collection

```bash
nxc ldap {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --bloodhound --collection All --dns-server {{DC}}
```

- [ ] Use CE ingestion and review collection errors before trusting missing paths.
- [ ] Verify All's methods for the installed NetExec version; it can contact member hosts and differs from SharpHound.
- [ ] Use [attack-path prerequisites](active-directory/attack-paths#acl-abuse) before acting on a graph edge.

[NetExec CE default](https://www.netexec.wiki/ldap-protocol/bloodhound-ingestor), [current method resolver](https://github.com/Pennyw0rth/NetExec/blob/main/nxc/protocols/ldap/bloodhound.py), [Python collector limits](https://github.com/dirkjanm/BloodHound.py).
