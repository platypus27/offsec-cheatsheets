---
title: Windows path reference
order: 1
tags: [windows, paths, registry, powershell, credentials, logs]
---

Adapted from the supplied [Field Manual path tables](https://app.notion.com/413bbf9f0e748189b961d23104ab7509).
`%NAME%` is CMD environment notation; use `$env:NAME` in PowerShell. Known Folders
can be redirected or cloud-backed. Registry and certificate-provider paths below
are labeled separately from disk paths.

## System and architecture

| Path | Purpose and caveat |
| --- | --- |
| `%SystemRoot%` | Windows installation, commonly `C:\Windows` |
| `%SystemRoot%\System32` | Native system components; 32-bit processes may be redirected |
| `%SystemRoot%\SysWOW64` | 32-bit components on 64-bit Windows |
| `%SystemRoot%\Sysnative` | Virtual alias for a 32-bit process to reach native System32 |
| `%SystemRoot%\System32\drivers\etc\hosts` | Local host overrides |
| `%SystemRoot%\Panther` | Setup logs/answer-file context; stage and access vary |
| `%ProgramFiles%`, `%ProgramFiles(x86)%` | Application installs, dependent on process/OS architecture |
| `%ProgramData%` | Shared machine application data; per-application ACLs |

## User and application data

| Path | Purpose and caveat |
| --- | --- |
| `%USERPROFILE%` | Current user's profile |
| `%USERPROFILE%\Desktop`, `Documents`, `Downloads` | Common defaults; Known Folder locations can differ |
| `%PUBLIC%` | Shared public profile; file permissions remain relevant |
| `%APPDATA%` | Roaming application data |
| `%LOCALAPPDATA%` | Local application data |
| `%TEMP%`, `%LOCALAPPDATA%\Temp`, `%SystemRoot%\Temp` | Temporary paths; variables and file ACLs vary |
| `%APPDATA%\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt` | Common PSReadLine history; ask the host for the actual save path |
| `%USERPROFILE%\Documents\WindowsPowerShell`, `Documents\PowerShell` | Windows PowerShell versus PowerShell 7 conventions |
| `%APPDATA%\Code\User`, `%USERPROFILE%\.vscode\extensions` | VS Code settings/extensions; portable/profiles can differ |
| `%LOCALAPPDATA%\Google\Chrome\User Data`, `%LOCALAPPDATA%\Microsoft\Edge\User Data` | Browser profiles; protected values are not plaintext credentials |
| `%APPDATA%\Mozilla\Firefox\Profiles` | Common Firefox profiles; selected profile may differ |

## Accounts, keys and certificates

| Path | Purpose and caveat |
| --- | --- |
| `%SystemRoot%\System32\config\SAM`, `SYSTEM`, `SECURITY` | Protected local registry hive files; live files may be locked |
| `%SystemRoot%\NTDS\ntds.dit` | AD database on a DC; path is configurable |
| `%USERPROFILE%\.ssh` | SSH client keys/config/authorization files |
| `%ProgramData%\ssh\sshd_config` | Optional OpenSSH server configuration |
| `%ProgramData%\ssh\administrators_authorized_keys` | Default administrator match-rule public keys |
| `%APPDATA%\Microsoft\Protect`, `Microsoft\Credentials` | DPAPI/master-key and credential storage; protected data |
| `%LOCALAPPDATA%\Microsoft\Vault` | Windows Vault data; not automatically decryptable |
| `%ProgramData%\Microsoft\Crypto\RSA\MachineKeys` | Restricted machine private-key containers |
| `Cert:\CurrentUser\My`, `Cert:\LocalMachine\My` | PowerShell certificate-provider stores, not disk directories |

## Services, tasks and startup

| Location | Kind and purpose |
| --- | --- |
| `%SystemRoot%\System32\Tasks` | Disk - protected task definitions; action paths are inside definitions |
| `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup` | Disk - current-user startup shortcuts |
| `%ProgramData%\Microsoft\Windows\Start Menu\Programs\Startup` | Disk - all-users startup shortcuts |
| `%SystemRoot%\SYSVOL` | Disk - DC policy/script data; deployment path may differ |
| `HKLM\SYSTEM\CurrentControlSet\Services` | Registry - services/drivers |
| `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` | Registry - per-user sign-in programs |
| `HKLM\Software\Microsoft\Windows\CurrentVersion\Run` | Registry - machine sign-in programs; architecture views can differ |
| `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon` | Registry - logon settings; check effective configuration |

## Logs and application leads

| Path | Purpose and caveat |
| --- | --- |
| `%SystemRoot%\System32\winevt\Logs` | Event logs; channels may use custom paths |
| `%SystemRoot%\Logs\CBS`, `Logs\DISM` | Servicing logs |
| `%LOCALAPPDATA%\CrashDumps`, `%SystemRoot%\Minidump` | Optional crash data |
| `C:\inetpub\wwwroot`, `C:\xampp\htdocs` | Common IIS/XAMPP roots; confirm the site's real configuration |
| `{SITE}\web.config`, `{APP}\*.config` | Application-selected settings and connection strings |
| `%USERPROFILE%\.gitconfig`, `{PROJECT}\.git` | Development configuration/metadata |

Use [credential hunting](windows/credential-harvesting) and
[service/task ACL inspection](windows/services-and-tasks), not path presence alone,
to choose the next operation.
