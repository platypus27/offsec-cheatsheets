---
title: Proxies and file-service checks
order: 6
tags: [redis, rsync, tftp, proxy, curl, services]
---

Run on **Kali** after confirming the service. This extends the supplied
[service-index workflow](https://app.notion.com/413bbf9f0e74815a8c4fe95771f4b6c4)
using the linked client documentation. Prefer a minimal read-only check before
assuming write access or an execution path.

## HTTP proxy check

```bash
curl -i --proxy 'http://{{RHOST}}:{{PROXY_PORT}}' '{{DESTINATION_URL}}'
```

Choose an in-scope destination that distinguishes a proxy response from the
destination's response. Proxy authentication, CONNECT policy, TLS trust and
destination restrictions are independent. A proxy listener is not a general route.
[curl proxy options](https://curl.se/docs/manpage.html).

## Redis inspection

```bash
redis-cli -h '{{RHOST}}' -p '{{REDIS_PORT}}' PING
```

With a known account, avoid putting the password in the command line:

```bash
redis-cli -h '{{RHOST}}' -p '{{REDIS_PORT}}' --user '{{REDIS_USER}}' --askpass
```

Inside the authorized session, inspect `ACL WHOAMI` and the permitted `INFO`
sections. A PONG does not grant CONFIG, filesystem or module-loading rights.
[Redis CLI](https://redis.io/docs/latest/develop/tools/cli/).

## rsync modules

```bash
rsync --list-only 'rsync://{{RHOST}}/'
rsync --list-only 'rsync://{{RHOST}}/{{MODULE}}/'
```

Record published modules and their actual read/auth requirements. Listing a
module does not establish write access or the backing path's execution context.
[rsync manual](https://download.samba.org/pub/rsync/rsync.1).

## TFTP transfer

For an exact, known filename on a confirmed TFTP service:

```bash
tftp '{{RHOST}}' -c get '{{REMOTE_FILE}}' '{{LOCAL_FILE}}'
```

TFTP generally does not provide a directory listing. Check the installed client's
help and transfer mode for binary data; do not guess sensitive filenames from a
port result. Verify size and checksum after transfer.
[tftp-hpa manual](https://manpages.debian.org/stable/tftp-hpa/tftp.1.en.html).

## H2 database and console

H2 is a Java SQL database that can run inside the application process, as a
server, or in mixed mode. The browser-based H2 Console is a separate interface.
A Java application using H2 locally need not expose a TCP database or a console.

Record the installed library version, connection mode and whether the console is
enabled. Keep optional administrative interfaces limited to expected operators,
and use the database owner's configuration to confirm the service boundary.
See [H2 connection modes](https://h2database.com/html/features.html#connection_modes).

## FreeSWITCH signaling and management

FreeSWITCH handles calls through signaling and media components. The Event Socket
is a management interface for events and API operations, separate from SIP
signaling or RTP media. Exposure of one interface says little about the others.

Record the interface owner, bind address and expected clients. Keep management
access on loopback or a dedicated administrator network as appropriate, enforce
a narrow inbound ACL, and manage its authentication secret independently from
SIP credentials. See [FreeSWITCH Event Socket](https://developer.signalwire.com/freeswitch/integration/event-socket/).
