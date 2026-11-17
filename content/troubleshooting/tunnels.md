---
title: Tunnel and callback failures
order: 5
tags: [troubleshooting, pivot, tunnels, routes, dns, socks, callback]
---

## Diagnose the path in order

| Symptom | Minimal check | Boundary |
| --- | --- | --- |
| Agent cannot connect | Test receiver bind/port from the pivot | Control route, egress, TLS or listener |
| Agent connects, destination fails | Test destination locally from the pivot, then from Kali | Route, session, target firewall or destination bind |
| Destination IP works, name fails | Query one name using the intended resolver/path | DNS |
| SOCKS browsing works, SYN scan fails | Use a supported TCP connect operation | Raw packets bypass the proxy |
| Internal web works, callback fails | Trace target -> pivot listener -> operator handler | Reverse path is independent |
| Tunnel fails after restart | Compare live interface, route, listener and session | Stale or duplicate state |
| Remote SSH forward not exposed | Inspect server bind and forwarding policy | `GatewayPorts`/permit rules versus assumed interface |

## Test a proxied application

On Kali, for a confirmed local SOCKS listener:

```bash
curl --proxy socks5h://127.0.0.1:1080 '{{INTERNAL_URL}}'
```

This tests an application path with proxy-side name resolution. It does not prove
ICMP, UDP, raw scans or reverse payload routing. Use
[endpoint roles](pivoting/forwarding) and the
[tunnel checklist](pivoting/tunnelling#tunnel-troubleshooting) to isolate the next layer.
[curl SOCKS options](https://curl.se/docs/manpage.html), [supplied troubleshooting](https://app.notion.com/413bbf9f0e7481ed9f82f28b8daafdf5).
