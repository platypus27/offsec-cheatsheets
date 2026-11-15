---
title: AD enumeration over SMB
order: 2
tags: [ad, smb, netexec, shares, users]
---

## SMB domain login

Use the discovered domain label and a known domain account. Run against the intended member host so RHOST is that box. A successful login does not prove administrator or WinRM rights.

```bash
nxc smb {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}'
```

[Domain authentication](https://www.netexec.wiki/smb-protocol/authentication/checking-credentials-domain).

## SMB share permissions

```bash
nxc smb {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --shares
```

Record readable shares and inspect them with [smbclient](services/common-services#smb). [NetExec shares](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-shares-and-access).

## SMB domain users

```bash
nxc smb {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --users
```

Record returned usernames. Failure does not prove that the domain has no users. [NetExec user enumeration](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-domain-users).

## Anonymous and guest SMB shares

Try a null session and the explicit guest account separately. Record which identity produced which access.

```bash
nxc smb {{RHOST}} -u '' -p '' --shares
nxc smb {{RHOST}} -u guest -p '' --shares
smbclient -N -L '//{{RHOST}}'
```

Inspect only shares that are actually readable. Access denied does not rule out authenticated access later. [NetExec null sessions](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-null-sessions), [smbclient](https://www.samba.org/samba/docs/current/man-html/smbclient.1.html).

## GPP and autologin credentials

With authenticated access to SYSVOL, check for legacy Group Policy Preferences and autologin residue. These are historical misconfigurations, not guaranteed findings.

```bash
nxc smb {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' -M gpp_password
nxc smb {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' -M gpp_autologin
```

Also inspect [SYSVOL scripts and configuration](services/common-services#sysvol) directly. Validate recovered credentials with their actual authority. [NetExec module listing](https://www.netexec.wiki/smb-protocol/list-modules).
