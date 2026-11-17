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
