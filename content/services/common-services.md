---
title: Common services
order: 1
tags: [services, ftp, ssh, smb, http]
---

## FTP

Check anonymous login and the returned directory listing.

```bash
nmap -sV --script ftp-anon -p {{RPORT}} {{RHOST}}
```

Readable or writable files are leads; check what the account can actually access. [Source](https://nmap.org/nsedoc/scripts/ftp-anon.html).

## SSH

```bash
ssh -p {{RPORT}} '{{USER}}@{{RHOST}}'
```

Use the known account and verify the host key. For internal-only services, see [SSH forwarding](pivoting/tunnelling#port-forwarding). [Source](https://man.openbsd.org/ssh).

## SMB

List shares without credentials, then with a known domain account.

```bash
smbclient -L '{{RHOST}}' -N
smbclient -L '{{RHOST}}' -U '{{DOMAIN}}/{{USER}}%{{PASS}}'
```

Use an enumerated share name when connecting. [Source](https://www.samba.org/samba/docs/current/man-html/smbclient.1.html).

## Password brute force

Slow and loud; check the [password policy](active-directory/ad-enumeration#password-policy) for a lockout threshold first and prefer credential reuse.

```bash
hydra -l '{{USER}}' -P passwords.txt {{RHOST}} ssh -s {{RPORT}}
hydra -l '{{USER}}' -P passwords.txt ftp://{{RHOST}}
```

Stop on the first success and re-check the found pair with its [actual authority](active-directory/credential-access#domain-or-local-login). [THC-Hydra](https://github.com/vanhauser-thc/thc-hydra).

## SYSVOL

Read AD policy and logon scripts with a domain account:

```bash
smbclient '//{{RHOST}}/SYSVOL' -U '{{DOMAIN}}/{{USER}}%{{PASS}}'
```

Check readable scripts, backups and configuration files. Use [local authentication](active-directory/credential-access#domain-or-local-login) for local accounts. [Source](https://www.samba.org/samba/docs/current/man-html/smbclient.1.html).

## HTTP

Follow [fingerprinting](web/web-enumeration#technology-fingerprinting), [content discovery](web/web-enumeration#content-discovery) and [virtual hosts](web/web-enumeration#virtual-hosts).

## Databases

Choose the detected engine: [MSSQL](services/databases#mssql), [MySQL](services/databases#mysql) or [PostgreSQL](services/databases#postgresql).
