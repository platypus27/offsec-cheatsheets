---
title: Shell and transfer failures
order: 6
tags: [troubleshooting, transfer, shell, pty, architecture, powershell]
---

## File and runtime symptoms

| Symptom | Smallest useful check |
| --- | --- |
| HTTP server sees no request | Request the exact URL from the target's position; check bind/address/port/route |
| Executable is tiny or unreadable | Compare content, size and hash; it may be an error page |
| Linux permission denied | Check mode, parent access and mount `noexec`, not only `chmod` |
| Exec format error | Check OS, architecture, interpreter and executable format |
| .NET binary fails immediately | Check runtime/framework, target architecture and dependency requirements |
| Transfer succeeds, file missing | Recheck source/destination host, absolute path, parent and account permissions |
| Callback connects then closes | Match payload/handler protocol and inspect execution output |
| Terminal loses echo/editing | Identify whether local terminal mode or remote PTY changed |

## Inspect a Linux file

On the Linux host holding the file:

```bash
file '{{LOCAL_FILE}}'
ls -l '{{LOCAL_FILE}}'
sha256sum '{{LOCAL_FILE}}'
findmnt -T '{{LOCAL_FILE}}'
```

If transferring between Windows and Linux, hash the **same bytes** on each host
with the [matching tools](shells/file-transfers#verify-a-transferred-file).
The serving machine's log proves retrieval only, not target execution.

## Recover the local terminal

If the **Kali terminal** has lost echo after a shell upgrade, restore its mode:

```bash
stty sane
```

This runs locally, not in the remote shell. Do not paste terminal-control steps
into the wrong side. See [PTY setup](shells/shells#upgrading-a-shell).
[stty manual](https://www.gnu.org/software/coreutils/manual/html_node/stty-invocation.html), [supplied troubleshooting](https://app.notion.com/413bbf9f0e7481ed9f82f28b8daafdf5).
