---
title: Network and discovery failures
order: 1
tags: [troubleshooting, network, nmap, dns, tls, ports]
---

## Host and service symptoms

| Symptom | Smallest check | What it can establish |
| --- | --- | --- |
| No ping response | Verify route and probe one expected TCP port | ICMP may be filtered; silence is not proof the host is down |
| Fast scan finds nothing | Repeat one port at a lower rate | Loss, filtering and wrong address remain separate possibilities |
| Open port hangs with a client | Confirm protocol, TLS mode and hostname | Port number alone does not identify the service |
| `tcpwrapped` | Try the protocol manually on the same route | Access control or an early close can obstruct fingerprinting |
| UDP `open|filtered` | Send a service-specific request | No reply does not distinguish open from filtered |
| Name fails, IP works | Query the intended resolver and inspect its answer | Resolver routing and service identity may differ |
| Default HTTPS site | Preserve Host and SNI with the confirmed name | Changing only an HTTP header may not select TLS identity |

## Operator route inspection

On Kali:

```bash
ip -br address
ip route get '{{RHOST}}'
ss -lntp
dig @'{{DNS_SERVER}}' '{{TARGET_FQDN}}'
```

Check source interface, next hop, listener bind and resolver answer. If a service
works on the foothold only, compare its bind address and destination route before
adding a tunnel. [ip route](https://man7.org/linux/man-pages/man8/ip-route.8.html), [dig manual](https://bind9.readthedocs.io/en/latest/manpages.html#dig-dns-lookup-utility).

## Return to the workflow

Use [scanning](recon/scanning), [HTTP baseline](web/http-workflow#baseline-request)
or [forwarding](pivoting/forwarding) after identifying the failed layer.
[Supplied troubleshooting source](https://app.notion.com/413bbf9f0e7481ed9f82f28b8daafdf5).
