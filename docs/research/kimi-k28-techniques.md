# Kimi K28 techniques source evidence

Condensed 2026-11-14 to provenance records complementing source-evidence.md; shared sources are cross-referenced, not duplicated. Model: K2.8 Preview (config `kimi-code/kimi-for-coding`). The coordinator independently checked session 519f0bdb-c0bf-41f5-8449-2fde33960ba5's startup model alias and rendered label. Nothing was exercised against a target.

## Service enumeration

- DNS AXFR: [ISC BIND dig man page](https://manpages.debian.org/trixie/bind9-dnsutils/dig.1.en.html) (Debian mirror, copyright 2026). AXFR always uses TCP. Failure means refusal, reachability or server error, not necessarily a denied transfer ACL.
- FTP: [nmap NSE ftp-anon](https://nmap.org/nsedoc/scripts/ftp-anon.html): undated; default/auth/safe; root listing capped by `ftp-anon.maxlist` (default 20).
- SSH: [nmap NSE ssh2-enum-algos](https://nmap.org/nsedoc/scripts/ssh2-enum-algos.html): undated; safe/discovery; weak algorithms are configuration-review leads.
- SNMP: [net-snmp snmpwalk manual](http://www.net-snmp.org/docs/man/snmpwalk.html): page updated 2002; stable manual, not 2025 material. "public" is a guess; v2c communities are cleartext.
- NFS: [showmount(8)](https://man7.org/linux/man-pages/man8/showmount.8.html), man7 mirror of nfs-utils (obtained 2026-08-04, upstream commit 2026-07-23). Accuracy varies; NFSv4-only servers may not expose MNT; mount point is a local edit.
- MSSQL: [impacket](https://github.com/fortra/impacket): modified Apache license; README lists v0.13.1 stable. `-windows-auth` suits domain accounts. TODO: verify installed entry point name and Python version.
- MySQL: [nmap NSE mysql-info](https://nmap.org/nsedoc/scripts/mysql-info.html): undated; safe/discovery; prints version and capabilities without credentials.

## Remote access

- WinRM: [evil-winrm README](https://github.com/Hackplayers/evil-winrm): LGPLv3+; Ruby 2.3+ and gems; README notes OpenSSL 3.0 MD4 breakage. [Microsoft Enter-PSSession docs](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/enter-pssession?view=powershell-7.5): access is governed by target session configuration permissions; the default Microsoft.PowerShell endpoint requires administrators, custom endpoints need not. Default WinRM port 5985.
- RDP: [FreeRDP](https://github.com/FreeRDP/FreeRDP): Apache license; current 3.x docs list `/cert:ignore` for self-signed lab certificates. TODO: verify installed version (`xfreerdp /version`); use its documented spelling.

## Web triage

- LFI: [current PHP manual on php:// wrappers](https://www.php.net/manual/en/wrappers.php.php): `php://filter` is not restricted by allow_url_fopen; needs a discovered PHP include parameter and local base64 decoding.
- SQLi: [OWASP WSTG-INPV-05](https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection/) (stable): detection via quote/semicolon probes and boolean true/false comparison; confirmation via UNION, error or time-based techniques. curl manual: syntax source only. Response changes are leads, not confirmation.
- Upload: curl man page: syntax only; `-F` sends multipart. HTTP 200 proves neither storage nor execution; verify storage by requesting the expected location, then test execution. The field name must match the real form (source inspection per the video description); ./shell.php is a local edit.

## Privilege escalation leads and pivoting

- Cron: [crontab(5)](https://man7.org/linux/man-pages/man5/crontab.5.html) from cronie (upstream commit 2025-12-05). FILES names /etc/crontab, /etc/cron.d/, /var/spool/cron/; writable entries are leads.
- systemd timers: [systemctl(1)](https://man7.org/linux/man-pages/man1/systemctl.1.html): current manual; `list-timers --all` includes inactive timers.
- Windows services: [Microsoft sc-query reference](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/sc-query), [Sysinternals accesschk](https://learn.microsoft.com/en-us/sysinternals/downloads/accesschk) (published 2022-05-11). `state= all` lists active and inactive services; unquoted paths with spaces are weak-configuration leads; confirm ACLs with accesschk.
- Pivoting: curl man page, Chisel README (in source-evidence.md), [Microsoft Test-NetConnection docs](https://learn.microsoft.com/en-us/powershell/module/nettcpip/test-netconnection): test the chain through the SOCKS listener, bounded timeout; Test-NetConnection separates name, route and port failures; ss -lntup confirms local listeners.
