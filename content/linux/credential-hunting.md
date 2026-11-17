---
title: Linux credential hunting
order: 2
tags: [linux, credentials, configuration, history, files]
---

Run on the **Linux foothold**. Scope reads to the current user's permissions and
the application's actual paths. Adapted from [Credential Hunting](https://app.notion.com/413bbf9f0e7481aeba55c6987473d41e).

## User and application context

```bash
id
printf '%s\n' "$HOME" "$SHELL"
ls -la ~
ps auxww
ss -lntup
```

Connect each service to its process account, working directory and configuration.
An internal listener may need [forwarding](pivoting/forwarding) before enumeration.

## Targeted configuration search

Search an observed application's directory first, rather than dumping the whole
filesystem. Permission errors are normal and should not hide successful reads.

```bash
find '{{APP_DIR}}' -maxdepth 4 -type f \( -name '*.conf' -o -name '*.ini' -o -name '.env' -o -name '*config*.php' -o -name '*.bak' \) -readable -print 2>/dev/null
```

Inspect selected files for connection strings, service accounts and backup paths.
Verify whether each value is active, stale, encrypted or a sample. Keep the
original filename and application with the finding.

## History and SSH material

```bash
ls -la ~/.ssh
ls -la ~/.bash_history ~/.zsh_history ~/.mysql_history 2>/dev/null
cat ~/.ssh/config 2>/dev/null
cat ~/.ssh/authorized_keys 2>/dev/null
```

History can be disabled, incomplete or absent. `authorized_keys` contains public
keys; it is not the private key needed for login. `known_hosts` names are leads,
not account credentials. [OpenSSH file roles](https://man.openbsd.org/ssh).

## Credential provenance and reuse

Record the account, authority, source path, timestamp and intended service in Lab
notebook. Validate one intended use, then distinguish authentication from command
execution. Do not assume a database password belongs to a local or domain user.

Use [protected-file extraction](passwords/cracking) for an encrypted key or archive.
Review [common paths](reference/linux-paths) when the application location is unclear.
