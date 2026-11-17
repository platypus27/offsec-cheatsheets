---
title: Identify, extract and crack
order: 0
tags: [passwords, hashes, hashcat, john, archive, ssh, keepass]
---

Run on **Kali/operator hardware** with recovered lab material. Adapted from
[Password Cracking](https://app.notion.com/413bbf9f0e7481dc9190e8cbe61668b7).
Preserve the original file, account, source and full value before conversion.

## Choose the format

| Material | Evidence and format |
| --- | --- |
| NT hash | Provenance from SAM/NTDS or matching tool output; Hashcat 1000 |
| NetNTLMv2 | Full username/domain/challenge/response capture; Hashcat 5600 |
| DCC2 | Complete iteration/user/hash line; [format and mode 2100](active-directory/credential-dumping#crack-cached-logons) |
| AS-REP or TGS | [Match the encryption marker](active-directory/kerberos#kerberos-hash-modes) |
| ZIP, SSH, KeePass or Office | Use the matching extractor and confirm the resulting tool format |

A detector provides candidates, not provenance. A 32-character hex value alone
does not distinguish NT from other algorithms. [Hashcat example formats](https://github.com/hashcat/hashcat/blob/master/docs/hashcat-example-hashes.md).

## Hashcat dictionary job

Set HASH_MODE from the verified format, not from hash length.

```bash
hashcat -m '{{HASH_MODE}}' '{{HASH_FILE}}' /home/kali/tools/wordlists/rockyou.txt --session '{{CRACK_SESSION}}'
```

Read parser errors before expanding the candidate set. Avoid `--force` as a
routine workaround. [Hashcat help](https://hashcat.net/wiki/doku.php?id=hashcat).

## Rules, results and resume

For a justified rule-based candidate expansion:

```bash
hashcat -m '{{HASH_MODE}}' '{{HASH_FILE}}' '{{WORDLIST}}' -r /usr/share/hashcat/rules/best64.rule --session '{{CRACK_SESSION}}'
```

Inspect recovered results with the same mode and input:

```bash
hashcat -m '{{HASH_MODE}}' '{{HASH_FILE}}' --show
```

Resume a saved session separately:

```bash
hashcat --session '{{CRACK_SESSION}}' --restore
```

An exhausted job means these candidates failed. Recheck input format and source
before spending more time. [Session and restore options](https://hashcat.net/wiki/doku.php?id=restore).

## Protected archive extraction

```bash
zip2john '{{ZIP_FILE}}' > '{{HASH_FILE}}'
john --wordlist=/home/kali/tools/wordlists/rockyou.txt '{{HASH_FILE}}'
john --show '{{HASH_FILE}}'
```

Inspect converter errors and archive type. A ZIP verifier is not an arbitrary
Hashcat mode input. Keep the original archive unchanged.
[John jumbo documentation](https://github.com/openwall/john/tree/bleeding-jumbo/doc).

## John dictionary job

Continue with input confirmed to match John, including the converters above.
Keep their original format labels and review the extractor's warnings.

```bash
john --wordlist=/home/kali/tools/wordlists/rockyou.txt '{{HASH_FILE}}'
john --show '{{HASH_FILE}}'
```

If John cannot identify the format, inspect `john --list=formats` and select
`--format` only from the actual file and extractor evidence. Do not send the same
file to Hashcat without verifying its required input representation and mode.
[John jumbo usage](https://github.com/openwall/john/blob/bleeding-jumbo/doc/README).

## SSH private-key extraction

```bash
ssh2john '{{SSH_KEY}}' > '{{HASH_FILE}}'
john --wordlist=/home/kali/tools/wordlists/rockyou.txt '{{HASH_FILE}}'
john --show '{{HASH_FILE}}'
```

Recovering a passphrase unlocks that key; it does not establish the SSH username
or server authorization. Some Kali installs expose the script by absolute path;
check `command -v ssh2john` and the installed John package if unavailable.
[ssh2john source](https://github.com/openwall/john/blob/bleeding-jumbo/run/ssh2john.py).

## KeePass database extraction

```bash
keepass2john '{{KEEPASS_FILE}}' > '{{HASH_FILE}}'
john --wordlist=/home/kali/tools/wordlists/rockyou.txt '{{HASH_FILE}}'
```

A key file or unsupported database version changes the recovery requirements.
Read extractor output rather than stripping labels blindly. Validate the recovered
secret against the actual database, then label each credential's authority.
[keepass2john source](https://github.com/openwall/john/blob/bleeding-jumbo/src/keepass2john.c).
