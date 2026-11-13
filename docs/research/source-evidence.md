# Cheatsheet source evidence

Condensed 2026-11-14 to provenance records: URL, verified date, caveat. Commands live in app content; companion: kimi-k28-techniques.md.

Freshness scope: 2025 onward releases and currently maintained primary manuals. Older stable manual dates remain explicit; they are not presented as 2025 publications.

## Supplied material

- [BuilderGoh OSCP Master Cheatsheet](https://github.com/BuilderGoh/OSCP-Master-Cheatsheet): last push 2026-09-29, no license declared. Topic selection only; no prose copied.
- [My OSCP Web Enumeration Methodology](https://www.youtube.com/watch?v=JEjhP1wCUgo), Hacker Blueprint: published 2026-11-10 (oEmbed, watch-page microformat). Description lists headers, source inspection, content discovery, subdomains, robots/sitemap, parameter testing, credential reuse; inspected only, not watched; transcript empty. TODO: verify spoken-content claims.

## Recon

- [Nmap manual](https://nmap.org/book/man.html): [host discovery](https://nmap.org/book/man-host-discovery.html), [port selection](https://nmap.org/book/man-port-specification.html), [scan techniques](https://nmap.org/book/man-port-scanning-techniques.html), [version detection](https://nmap.org/book/man-version-detection.html), [output](https://nmap.org/book/man-output.html). Current manual, no per-page dates. Caveat: UDP `open|filtered` is inconclusive; never trust port-number identification.

## Web and transfer

- [ffuf README](https://github.com/ffuf/ffuf): MIT, last push 2026-09-26. Caveats: wordlists are local files; vhost entries must be bare labels; `-fs` takes a measured size only.
- [curl man page](https://curl.se/docs/manpage.html): current docs, not 2025-dated. Caveat: `-k` only as an explicit decision for a known lab certificate.

## Services

- [smbclient man page](https://www.samba.org/samba/docs/current/man-html/smbclient.1.html): current manual, no page date. Caveat: share names come from enumeration, not guessing.
- [MySQL 8.4 connecting](https://dev.mysql.com/doc/refman/8.4/en/connecting.html), [psql manual](https://www.postgresql.org/docs/current/app-psql.html): current manuals; PostgreSQL page advertises 2026-11-12 maintenance releases. Caveat: MySQL `-P` vs psql `-p`; initial database name is a choice (TODO: verify if login fails).
- [OpenBSD nc](https://man.openbsd.org/nc): footer 2025-06-24. Caveats: `-l` takes a positional port, not `-p`; its `-e` is a TLS name option; other netcat implementations differ.
- [Python pty](https://docs.python.org/3/library/pty.html), [http.server](https://docs.python.org/3/library/http.server.html): current Python docs, date not confirmed. Caveats: pty needs `/bin/bash` on target; the basic server follows symlinks, not a security boundary.
- [Invoke-WebRequest, PowerShell 7.5](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-webrequest?view=powershell-7.5): current Microsoft docs. TODO: verify installed PowerShell version before newer options.

## Linux and Windows enumeration

- [sudo](https://www.sudo.ws/docs/man/sudo.man/), [GNU find](https://www.gnu.org/software/findutils/manual/html_mono/find.html), [getcap](https://man7.org/linux/man-pages/man8/getcap.8.html) (footer 2026-04-07), [ss](https://man7.org/linux/man-pages/man8/ss.8.html): current manuals. Caveat: output is leads, not proof of escalation.
- [PEASS-ng](https://github.com/peass-ng/PEASS-ng) ([license](https://github.com/peass-ng/PEASS-ng/blob/master/LICENSE)): last push 2026-11-09; modified GPL-based terms, not MIT. WinPEAS C# needs .NET 4.5.2+ per README. TODO: verify downloaded WinPEAS name and help.
- [whoami](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/whoami), [systeminfo](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/systeminfo): current Server 2025 docs; systeminfo footer 2023-02-03.
- [schtasks query](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/schtasks-query) (footer 2024-02-16), [icacls](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/icacls) (footer 2025-06-09). Caveat: an ACL listing alone is not a runnable escalation path.

## Pivoting

- [OpenBSD ssh](https://man.openbsd.org/ssh): current manual, date not captured. Caveat: forwarding requires permitted forwarding; a forwarded port alone does not validate application access.
- [Chisel README](https://github.com/jpillora/chisel): MIT, last push 2026-10-11. Caveats: `--reverse` required server-side; `--fingerprint` must come from the actual server.

## Design comparison

- ffuf (above; explicit match/filter, opt-in recursion) vs [feroxbuster](https://github.com/epi052/feroxbuster) (recursive discovery; last push 2026-11-12): both MIT, active in 2026; OpenSSH forwarding is built in, Chisel adds an HTTP-transported reverse tunnel.

## Exam day

- [Official OSCP+ exam guide](https://help.offsec.com/hc/en-us/articles/360040165632-OSCP-Exam-Guide): updated 2026-10-21. Caveats: 23h45m exam plus 24h upload window; proof via `cat`/`type` in an interactive shell; a 2026-12-01 scoring change is pending; recheck per sitting. TODO: verify archive/PDF naming, upload flow, control-panel objectives.
