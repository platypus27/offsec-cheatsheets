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

## Ligolo-ng tunnel

Use when whole tools (nmap, WinRM clients) must reach an internal range through one pivot. Run the proxy as root on Kali and the agent on the pivot:

```bash
# Operator machine
sudo ./proxy -selfcert
```

```powershell
# Pivot machine
.\agent.exe -connect {{LHOST}}:11601 -ignore-cert
```

In the proxy prompt, `session`, select the pivot, then `start` to bring the `ligolo` interface up. Route the internal range through it, then verify:

```bash
sudo ip route add 10.10.139.0/24 dev ligolo
ping 10.10.139.142
```

Replace the example range with the pivot's own subnet from `ipconfig`. [Ligolo-ng](https://github.com/nicocha30/ligolo-ng).

## Scan through a tunnel

With a routed interface (Ligolo), aim scanners directly at the internal range:

```bash
sudo nmap -sS -p- -Pn -n 10.10.139.142 -oA ms02-tcp
```

With a SOCKS proxy instead, wrap the tool and force full connect scans; ping and SYN scans do not traverse SOCKS:

```bash
proxychains nmap -sT -Pn -p 445,5985 {{MS02}}
```

Confirm reachability per host before interpreting a scan as complete. [Nmap scan techniques](https://nmap.org/book/man-port-scanning-techniques.html), [proxychains](https://github.com/haad/proxychains).
