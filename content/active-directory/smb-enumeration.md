---
title: AD enumeration over SMB
order: 2
tags: [ad, smb, netexec, shares, users]
---

## SMB domain login

Use the discovered domain label and a known domain account. A successful login does not prove administrator or WinRM rights.

```bash
nxc smb {{MS01}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}'
nxc smb {{MS02}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}'
```

[Domain authentication](https://www.netexec.wiki/smb-protocol/authentication/checking-credentials-domain).

## SMB share permissions

```bash
nxc smb {{MS01}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --shares
nxc smb {{MS02}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --shares
```

Record readable shares and inspect them with [smbclient](services/common-services#smb). [NetExec shares](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-shares-and-access).

## SMB domain users

```bash
nxc smb {{MS01}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --users
nxc smb {{MS02}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --users
```

Record returned usernames. Failure does not prove that the domain has no users. [NetExec user enumeration](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-domain-users).
