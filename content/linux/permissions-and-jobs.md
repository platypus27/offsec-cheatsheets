---
title: Linux permissions and scheduled execution
order: 1
tags: [linux, sudo, suid, capabilities, cron, systemd, privesc]
---

Run on the **Linux foothold**. Adapted from [Linux Privilege Escalation](https://app.notion.com/413bbf9f0e7481219946de4e77e65650).
Prove the exact permission and privileged consumer before changing any file.

## Inspect sudo precisely

```bash
sudo -l
```

Read the run-as user, command path, arguments, `NOPASSWD`, `SETENV` and excluded
commands. Check the exact binary/version against its documented behavior and the
matching [GTFOBins entry](https://gtfobins.github.io/). `NOPASSWD` removes a prompt,
not the remaining command restrictions. [sudo manual](https://www.sudo.ws/docs/man/sudo.man/).

## SUID and SGID candidates

```bash
find / -xdev -type f \( -perm -4000 -o -perm -2000 \) -ls 2>/dev/null
```

`-xdev` stays on one filesystem; inspect other relevant mounts separately.
Check owner, mode, mount flags and whether the program drops privileges. A listed
SUID executable is not automatically an escalation primitive.

## File capabilities

```bash
getcap -r / 2>/dev/null
```

Record the exact capability set and executable. A capability must be effective
and usable by that program in the current namespace and mount context. Check
the specific operation before applying an interpreter recipe.
[Linux capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html).

## Cron and timers

```bash
crontab -l
cat /etc/crontab
ls -la /etc/cron.d /etc/cron.hourly /etc/cron.daily
systemctl list-timers --all
```

Observe an actual run, its owner, environment, command and interpreter. A writable
file is useful only if that privileged job consumes it and a trigger exists.
Inspect the unit's complete configuration with `systemctl cat {{UNIT}}`.
[systemd timers](https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html).

## Trace path permissions

```bash
namei -l '{{JOB_PATH}}'
ls -l '{{JOB_PATH}}'
readlink -f '{{JOB_PATH}}'
findmnt -T '{{JOB_PATH}}'
```

Check every parent, symlink target, interpreter and writable dependency. Relative
commands depend on the privileged process's PATH, not necessarily your shell's.
Back up only the specific lab file before a permitted change and restore its
original content/mode after the test. [namei](https://man7.org/linux/man-pages/man1/namei.1.html).

## Local services and mounts

```bash
ss -lntup
findmnt
cat /etc/exports 2>/dev/null
```

Inspect actual export/client restrictions and root-squash/UID mapping for NFS.
A loopback database may be reachable by a single [SSH forward](pivoting/forwarding#ssh-local-forward)
without exposing the entire network. Verify the final effective identity and
capture [proof](reporting/report#evidence) before moving on.
