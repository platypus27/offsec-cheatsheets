---
title: Tunnelling
order: 1
tags: [pivot, tunnel, ssh, socks, chisel]
---

## Port forwarding

RHOST is the SSH pivot. RPORT is a service on that pivot's loopback; LPORT is the operator's local port. SSH uses its default transport port.

```bash
ssh -N -L 127.0.0.1:{{LPORT}}:127.0.0.1:{{RPORT}} '{{USER}}@{{RHOST}}'
```

Connect the local client to 127.0.0.1:LPORT. Requires SSH access and permitted forwarding. [OpenSSH manual](https://man.openbsd.org/ssh).

## SOCKS proxies

RHOST is the SSH pivot; LPORT becomes the operator's SOCKS listener.

```bash
ssh -N -D 127.0.0.1:{{LPORT}} '{{USER}}@{{RHOST}}'
```

Configure a SOCKS-aware client to use it. Connections originate from the pivot. [OpenSSH manual](https://man.openbsd.org/ssh).

## Chisel reverse SOCKS

Use dedicated tunnel USER/PASS. LPORT is the control port; the SOCKS listener is a separate operator-side port, 1080.

```bash
# Operator machine
chisel server --port {{LPORT}} --reverse --auth '{{USER}}:{{PASS}}'
```

```bash
# Pivot machine
chisel client --auth '{{USER}}:{{PASS}}' '{{LHOST}}:{{LPORT}}' R:socks
```

The reverse SOCKS endpoint exits through the pivot. TODO: verify the actual server fingerprint before adding client fingerprint pinning. [Chisel help](https://github.com/jpillora/chisel).

## Tunnel troubleshooting

For this check, LPORT is the local SOCKS port, not the control port. RHOST/RPORT identify the internal HTTP service.

```bash
curl --socks5-hostname 127.0.0.1:{{LPORT}} -m 5 -i 'http://{{RHOST}}:{{RPORT}}/'
```

- [ ] Check the control connection and local listener separately.
- [ ] Verify the pivot can reach the destination and resolve its name.
- [ ] Test the application through the tunnel; a listening socket alone is insufficient.

[curl proxy and timeout options](https://curl.se/docs/manpage.html).
