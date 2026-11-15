---
title: AD enumeration over SMB
order: 2
tags: [ad, smb, netexec, shares, users]
---

## SMB login and share access

Use the account's actual authority. Run against the intended member host so RHOST is that box. A successful login does not prove administrator or WinRM rights.

```bash
# Domain account
nxc smb {{RHOST}} -u '{{USER}}' -p '{{PASS}}'
# Local account
nxc smb {{RHOST}} -u '{{USER}}' -p '{{PASS}}' --local-auth
nxc smb {{RHOST}} -u '{{USER}}' -p '{{PASS}}' --shares
smbclient -L '//{{RHOST}}' -U '{{USER}}%{{PASS}}'
```

Record readable shares and inspect them with [smbclient](services/common-services#smb). [NetExec authentication](https://www.netexec.wiki/smb-protocol/authentication/checking-credentials-domain), [NetExec shares](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-shares-and-access).

## GPP and autologin credentials

With authenticated access to SYSVOL, check for legacy Group Policy Preferences and autologin residue. These are historical misconfigurations, not guaranteed findings.

```bash
nxc smb {{DC}} -u '{{USER}}' -p '{{PASS}}' -M gpp_password
nxc smb {{DC}} -u '{{USER}}' -p '{{PASS}}' -M gpp_autologin
```

Also inspect [SYSVOL scripts and configuration](services/common-services#sysvol) directly. Validate recovered credentials with their actual authority. [NetExec module listing](https://www.netexec.wiki/smb-protocol/list-modules).
