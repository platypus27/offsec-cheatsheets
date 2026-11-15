---
title: Credential harvesting
order: 2
tags: [windows, credentials, rdcman, web-config, loot]
---

## Common locations

Check readable files that commonly hold plaintext or reusable credentials:

```cmd
type "C:\Users\Administrator\AppData\Local\Microsoft\Remote Desktop Connection Manager\RDCMan.settings"
type C:\inetpub\wwwroot\web.config
dir C:\Windows.old\Windows\System32\SAM /a
```

RDCMan stores per-server connection passwords; web.config holds connection strings; Windows.old keeps hives from before an upgrade. [Microsoft web.config](https://learn.microsoft.com/en-us/iis/configuration/system.webserver/), [Remote Desktop Connection Manager](https://learn.microsoft.com/en-us/sysinternals/downloads/rdcman).

## Application data files

Hunt served directories and user profiles for database and config files:

```cmd
dir /s /b C:\inetpub\*.db C:\inetpub\*.config C:\Users\*.db 2>nul
```

Download interesting files from an Evil-WinRM session with `download`, then inspect them locally. [Evil-WinRM file management](https://github.com/Hackplayers/evil-winrm#file-management).

## Strings on binaries

Downloaded binaries may carry hard-coded credentials:

```bash
strings admintool.exe | grep -i pass
```

Read the surrounding strings for context before trusting a match. [GNU strings](https://www.gnu.org/software/binutils/manual/html_node/strings.html).

## PowerShell history and transcripts

Read user-specific history and look for configured transcript directories. History often contains commands, paths, credentials or service accounts that automated scans only summarize.

```powershell
Get-Content "$env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt"
Get-ChildItem -Path C:\ -Filter '*transcript*' -Recurse -ErrorAction SilentlyContinue
```

Review only accessible files and preserve useful context around each finding. [PSReadLine history](https://learn.microsoft.com/en-us/powershell/module/psreadline/about/about_psreadline), [PowerShell transcription](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.host/start-transcript).

## AutoLogon registry credentials

Check the Winlogon configuration directly when autologon is suspected. A missing value is not evidence of a password elsewhere.

```cmd
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword
```

[Winlogon registry settings](https://learn.microsoft.com/en-us/troubleshoot/windows-server/user-profiles-and-logon/turn-on-automatic-logon).
