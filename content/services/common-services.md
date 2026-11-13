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

Use an enumerated share name when connecting. For AD policy and scripts:

```bash
smbclient '//{{RHOST}}/SYSVOL' -U '{{DOMAIN}}/{{USER}}%{{PASS}}'
```

Check readable scripts, backups and configuration files. Use [local authentication](active-directory/credential-access#domain-or-local-login) for local accounts. [Source](https://www.samba.org/samba/docs/current/man-html/smbclient.1.html).

## HTTP

Follow [fingerprinting](web/web-enumeration#technology-fingerprinting), [content discovery](web/web-enumeration#content-discovery) and [virtual hosts](web/web-enumeration#virtual-hosts).

## Databases

Choose the detected engine: [MSSQL](services/databases#mssql), [MySQL](services/databases#mysql) or [PostgreSQL](services/databases#postgresql). Check [WinRM](services/remote-access#winrm) or [RDP](services/remote-access#rdp) for remote logon.
