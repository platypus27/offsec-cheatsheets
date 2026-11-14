---
title: DNS, SNMP and NFS
order: 2
tags: [dns, axfr, snmp, nfs, rpc]
---

## DNS zone transfer

Query the named DNS server for the known domain.

```bash
dig @{{RHOST}} -p {{RPORT}} {{DOMAIN}} AXFR
```

Record names and addresses if permitted. Failure may be refusal or a connectivity/server error; inspect the response. [ISC dig manual](https://manpages.debian.org/trixie/bind9-dnsutils/dig.1.en.html).

## SNMP community walk

Set PASS to a known SNMP community string and RPORT to the UDP service port.

```bash
snmpwalk -v2c -c '{{PASS}}' {{RHOST}}:{{RPORT}} 1.3.6.1.2.1
```

Look for host, process and software information. SNMPv2c communities travel in cleartext. TODO: verify target SNMP version and community; do not assume a default. [Net-SNMP manual](https://www.net-snmp.org/docs/man/snmpwalk.html).

## SNMP extend scripts

When the walk shows NET-SNMP extend entries, configured commands may reveal or change credentials:

```bash
snmpwalk -v2c -c '{{PASS}}' {{RHOST}}:{{RPORT}} 1.3.6.1.4.1.8072.1.3.2
```

Extend output can contain plaintext commands such as password resets run as the SNMP service account. [Net-SNMP extend](http://www.net-snmp.org/docs/mibs/extend.html).

## NFS exports

```bash
showmount -e {{RHOST}}
```

This queries the MNT service. Empty or failed output does not rule out NFSv4-only exports. TODO: verify the discovered export path, allowed client and mount options before mounting. [nfs-utils manual](https://man7.org/linux/man-pages/man8/showmount.8.html).
