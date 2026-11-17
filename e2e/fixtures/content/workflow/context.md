---
title: Command context
---

Use this page on Kali with a reviewed ticket cache.

## Ticket access

Run on Kali after obtaining a service ticket. Confirm the returned identity.

- [ ] Verify ticket principal

```bash
impacket-wmiexec -k -no-pass '{{DOMAIN}}/{{USER}}'@'{{TARGET_COMPUTER}}'
```

## Ticket cleanup

- [ ] Verify ticket principal
