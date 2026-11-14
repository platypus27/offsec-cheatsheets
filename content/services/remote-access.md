---
title: Remote access
order: 4
tags: [winrm, rdp, windows]
---

## WinRM credential check

Use a known domain account. Explicit DOMAIN avoids NetExec's SMB domain lookup when SMB is unavailable. These NetExec commands use the default HTTP listener on 5985.

```bash
nxc winrm {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}'
```

Look for successful authentication and access indication, then verify execution below. [NetExec authentication](https://www.netexec.wiki/winrm-protocol/authentication).

## WinRM verify identity

```bash
nxc winrm {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' -X whoami
```

Record the returned identity; an SMB login alone does not prove WinRM execution rights. [NetExec command execution](https://www.netexec.wiki/winrm-protocol/command-execution).

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
