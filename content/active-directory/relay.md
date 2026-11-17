---
title: NTLM capture and relay
order: 8
tags: [ad, relay, ntlm, smb, responder, impacket]
---

## Capture or relay decision

A NetNTLMv2 response can support offline cracking or a live relay, depending on
the target protections. It is not the NT hash accepted by pass-the-hash. Record
the incoming principal, source, authentication protocol and intended destination.
Check [signing](active-directory/attack-paths#smb-signing-prerequisites),
[LDAP channel binding](active-directory/attack-paths#ldap-signing-and-channel-binding)
and [AD CS relay conditions](active-directory/attack-paths#esc8-relay-conditions)
independently. Do not assume relay to the source host works.

## Relay to SMB

On **Kali**, use a confirmed, in-scope SMB destination that accepts unsigned
authentication and an incoming identity with useful rights there. Stop competing
SMB/HTTP listeners. `-smb2support` enables SMB2, not a signing bypass.

```bash
sudo impacket-ntlmrelayx -t 'smb://{{RELAY_TARGET}}' -smb2support
```

Trigger only the [controlled authentication mechanism](services/databases#mssql-unc-authentication)
already demonstrated by the target. Inspect the relay output for authentication
and the actual action/result. A successful NTLM negotiation alone is insufficient.
The tool's default post-authentication behavior may collect local secrets when
the relayed identity is privileged; choose the intended action before starting.
[ntlmrelayx options and SMB attack behavior](https://github.com/fortra/impacket/blob/master/examples/ntlmrelayx.py).

## Listener and relay recovery

```bash
ss -lntp
ip route get '{{RELAY_TARGET}}'
```

If the listener never receives a connection, check interface, callback address,
route and trigger. If authentication arrives but relay fails, check signing,
channel binding, protocol support, principal rights and reflection restrictions.
Stop listeners after use and record any target-side changes for cleanup.
[ip route](https://man7.org/linux/man-pages/man8/ip-route.8.html), [ss](https://man7.org/linux/man-pages/man8/ss.8.html).
