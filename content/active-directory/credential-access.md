---
title: AD credentials and access
order: 3
tags: [ad, credentials, netexec, smb, kerberos]
---

## Domain or local login

Use the account's actual authority. A successful login does not establish administrator access.

```bash
# Domain account
nxc smb {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}'
# Local account
nxc smb {{RHOST}} -u '{{USER}}' -p '{{PASS}}' --local-auth
```

[Domain authentication](https://www.netexec.wiki/smb-protocol/authentication/checking-credentials-domain), [local authentication](https://www.netexec.wiki/smb-protocol/authentication/checking-credentials-local).

## Reuse one known credential

- [ ] Check [password policy](active-directory/ad-enumeration#password-policy) before repeated attempts.
- [ ] Test one intended host and service; record authority, result and actual access.
- [ ] Read [SMB shares](services/common-services#smb) and [remote access](services/remote-access#winrm) with the permissions obtained.

[Lockout considerations](https://www.netexec.wiki/smb-protocol/password-spraying).

## Remote Windows command

Requires administrative access and a working remote execution method. Verify the resulting identity.

```bash
nxc smb {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' -x whoami
```

NetExec's admin indicator is a lead; check the command result itself. [Source](https://www.netexec.wiki/smb-protocol/command-execution/execute-remote-command).

## Kerberos authentication

Set RHOST to the target FQDN and DC to the KDC hostname.

```bash
nxc smb {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' -k --kdcHost {{DC}}
```

Check [DNS and time](active-directory/kerberos#kerberos-dns-or-clock-failure) first. [Source](https://www.netexec.wiki/getting-started/using-kerberos).
