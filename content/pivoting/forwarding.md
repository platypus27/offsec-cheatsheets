---
title: Forwarding and endpoint roles
order: 2
tags: [pivot, ssh, socks, socat, portproxy, tunnels]
---

Adapted from [Pivoting and Tunneling](https://app.notion.com/413bbf9f0e7481bda7a0ddfc6ac6322d).
Draw operator, pivot, destination and callback endpoints before choosing a command.

## SSH local forward

Run on **Kali**. The destination is resolved/reached from the SSH pivot. This
example binds only Kali loopback and exposes one pivot-reachable service.

```bash
ssh -N -o ExitOnForwardFailure=yes -L '127.0.0.1:{{LOCAL_PORT}}:{{DEST_HOST}}:{{DEST_PORT}}' '{{USER}}@{{PIVOT_HOST}}'
```

Connect the client to `127.0.0.1:LOCAL_PORT`. For a pivot-loopback service, set
DEST_HOST to `127.0.0.1`. Hostnames used by HTTP, TLS and Kerberos can still need
their original service identity. [OpenSSH forwarding](https://man.openbsd.org/ssh).

## SSH remote forward

Run on the **pivot** when it can establish SSH to the operator. The destination
after `-R` is reached from the pivot; the listening socket is on the SSH server.

```bash
ssh -N -o ExitOnForwardFailure=yes -R '127.0.0.1:{{REMOTE_PORT}}:{{DEST_HOST}}:{{DEST_PORT}}' '{{SSH_USER}}@{{LHOST}}'
```

The server's forwarding policy controls permitted binds. Loopback binding avoids
exposing the service on every operator interface. A successful SSH login does
not prove a permitted forward.

## SSH dynamic SOCKS

Run on **Kali** and configure a SOCKS-aware client explicitly:

```bash
ssh -N -D 127.0.0.1:1080 '{{USER}}@{{PIVOT_HOST}}'
```

For a web request with proxy-side DNS resolution:

```bash
curl --proxy socks5h://127.0.0.1:1080 '{{INTERNAL_URL}}'
```

Raw SYN packets do not travel through SOCKS. Check the client's DNS mode and
use supported TCP connect behavior for [proxied scans](pivoting/tunnelling#scan-through-a-tunnel).
[curl SOCKS modes](https://curl.se/docs/manpage.html).

## Socat TCP relay

Run on the **pivot** when a single TCP listener must relay to a reachable endpoint.
Choose the narrowest appropriate bind address and check for an existing listener.

```bash
socat TCP-LISTEN:{{LISTEN_PORT}},bind={{PIVOT_BIND}},reuseaddr,fork TCP:{{DEST_HOST}}:{{DEST_PORT}}
```

This forwards TCP, not an entire route. Both connection directions and firewall
rules still matter. Stop the relay after the task. [socat manual](https://www.dest-unreach.org/socat/doc/socat.html).

## Windows portproxy inspection

On an **authorized elevated Windows pivot**, inspect existing forwards first:

```cmd
netsh interface portproxy show all
```

For a required TCP mapping, record the previous state and choose explicit endpoints:

```cmd
netsh interface portproxy add v4tov4 listenaddress={{PIVOT_BIND}} listenport={{LISTEN_PORT}} connectaddress={{DEST_HOST}} connectport={{DEST_PORT}}
```

Firewall permission and IP Helper/service prerequisites are separate. Do not
disable the firewall globally. Remove only this mapping when finished:

```cmd
netsh interface portproxy delete v4tov4 listenaddress={{PIVOT_BIND}} listenport={{LISTEN_PORT}}
```

[Microsoft portproxy](https://learn.microsoft.com/en-us/windows-server/networking/technologies/netsh/netsh-interface-portproxy).

## Route and callback ledger

Record each listener's bind/port, which host resolves the destination, the tunnel
session, static routes, DNS resolver and the reverse callback path. Use
[Ligolo/Chisel](pivoting/tunnelling) for the supplied routed/SOCKS workflows.
Remove only interfaces, routes and forwards created for this exercise.
