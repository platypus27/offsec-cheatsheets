---
title: Scanning
order: 1
tags: [recon, nmap, tcp, udp, ports]
---

## Host discovery

RHOST may be one host or an explicitly scoped range. A silent host is not necessarily down.

```bash
nmap -sn {{RHOST}} -oA discovery
```

## Port scanning

All TCP ports, skipping discovery. Requires privileges for SYN scanning.

```bash
sudo nmap -sS -p- -Pn -n {{RHOST}} -oA tcp-all
```

Use a distinct output basename per target to avoid overwriting scans.

## Service detection

Set RPORT to the discovered port or comma-separated port list.

```bash
nmap -sV -sC -p {{RPORT}} -Pn {{RHOST}} -oA service
```

Identify the service from responses, not its port number. Review selected NSE scripts before using them.

## UDP scanning

```bash
sudo nmap -sU --top-ports 100 -Pn {{RHOST}} -oA udp-top100
```

open|filtered is inconclusive. Follow up with service-specific probes; this is not a complete UDP scan.

## Save Nmap output

- [ ] Keep normal, XML and grepable files produced by -oA.
- [ ] Paste scan output into the app's output parser, then follow matching service suggestions.
- [ ] Repeat [service enumeration](services/common-services#ftp) when a new foothold reveals another network.

[Discovery](https://nmap.org/book/man-host-discovery.html), [port selection](https://nmap.org/book/man-port-specification.html), [techniques](https://nmap.org/book/man-port-scanning-techniques.html), [version detection](https://nmap.org/book/man-version-detection.html), [output](https://nmap.org/book/man-output.html).
