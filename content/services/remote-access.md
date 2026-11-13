---
title: Remote access
order: 4
tags: [winrm, rdp, windows]
---

## WinRM

Requires valid credentials, WinRM access rights and a reachable listener. RPORT is usually 5985 for HTTP or 5986 for HTTPS; add -S for HTTPS.

```bash
evil-winrm -i {{RHOST}} -P {{RPORT}} -u '{{USER}}' -p '{{PASS}}'
```

[Current tool help](https://github.com/Hackplayers/evil-winrm).

## RDP

Requires remote logon rights. Authenticate and verify the session identity.

```bash
xfreerdp /v:{{RHOST}}:{{RPORT}} /u:'{{USER}}' /p:'{{PASS}}'
```

TODO: verify the installed FreeRDP executable name and certificate-validation options; accept a lab certificate only after checking it.

[FreeRDP command-line reference](https://github.com/FreeRDP/FreeRDP/wiki/CommandLineInterface).
