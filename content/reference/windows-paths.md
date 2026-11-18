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

## Boot, recovery and packages

| Path | Purpose and caveat |
| --- | --- |
| `\EFI\Microsoft\Boot\` on the EFI system partition | UEFI boot files; the partition normally has no drive letter |
| `%SystemRoot%\System32\Recovery\` | Recovery configuration context; the WinRE image may reside on a recovery partition |
| `%SystemRoot%\WinSxS` | Component store managed by Windows servicing |
| `%SystemRoot%\System32\DriverStore\FileRepository` | Staged driver packages; this does not identify the active driver by itself |
| `%SystemRoot%\SoftwareDistribution\Download` | Windows Update download cache |
| `%SystemRoot%\Installer` | Windows Installer cache; maintenance and removal depend on these files |
| `%ProgramFiles%\WindowsApps` | Protected app package installations; defaults can vary by volume |

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
| `%LOCALAPPDATA%\Packages` | Per-user packaged app data; distinguish package identity from installation directory |
| `%USERPROFILE%\OneDrive` | Common sync root; tenant and Known Folder redirection can affect the path |
| `%LOCALAPPDATA%\Microsoft\Outlook` | Common Outlook data root; profiles and storage type vary |
| `%LOCALAPPDATA%\Microsoft\WinGet\Packages` | Common per-user WinGet portable package root; scope and package type matter |
| `%SystemRoot%\Fonts`, `%LOCALAPPDATA%\Microsoft\Windows\Fonts` | Machine and per-user fonts |
| `%LOCALAPPDATA%\Microsoft\Windows\Themes`, `%SystemRoot%\Resources\Themes` | Personal and system themes |
| `%LOCALAPPDATA%\Temp`, `%LOCALAPPDATA%\Microsoft\Windows\INetCache` | User temporary data and Windows Internet cache, distinct from browser-specific cache layouts |

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

## Networking, disks and virtualization

| Location | Kind and purpose |
| --- | --- |
| `%SystemRoot%\System32\drivers\etc\services` | Disk - service name to port mappings; independent of listeners |
| `HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters` | Registry - TCP/IP configuration context; effective interface/DNS state can differ |
| `\\{SERVER}\{SHARE}\` | UNC network share; drive mappings are session-specific |
| `\\?\Volume{GUID}\` | Volume GUID path; a volume can have multiple mount paths |
| `%SystemDrive%\$Recycle.Bin`, `%SystemDrive%\System Volume Information` | Per-volume recycle and protected system data respectively |
| `%ProgramData%\Microsoft\Windows\Hyper-V` | Common Hyper-V configuration root; virtual disk locations are configurable |
| `\\wsl.localhost\{DISTRO}\`, `\\wsl$\{DISTRO}\` | WSL filesystem access from Windows; use the exposed share and keep backing virtual disks under WSL management |
| `%USERPROFILE%\.wslconfig` | User-level WSL VM settings; distinct from `/etc/wsl.conf` inside a distro |

## Logs and application leads

| Path | Purpose and caveat |
| --- | --- |
| `%SystemRoot%\System32\winevt\Logs` | Event logs; channels may use custom paths |
| `%SystemRoot%\Logs\CBS`, `Logs\DISM` | Servicing logs |
| `%SystemRoot%\INF\setupapi.dev.log` | Device installation log |
| `%SystemRoot%\Memory.dmp` | Common full or kernel crash dump path; contents can be sensitive |
| `%ProgramData%\Microsoft\Windows\WER\` | Windows Error Reporting state; contents and retention depend on policy |
| `%LOCALAPPDATA%\CrashDumps`, `%SystemRoot%\Minidump` | Optional crash data |
| `C:\inetpub\wwwroot`, `C:\xampp\htdocs` | Common IIS/XAMPP roots; confirm the site's real configuration |
| `%SystemRoot%\System32\inetsrv\config\applicationHost.config` | IIS server configuration when IIS is installed |
| `%SystemDrive%\inetpub\logs\LogFiles` | Common IIS log root; site configuration can override it |
| `%ProgramFiles%\Microsoft SQL Server\` | Common SQL Server install root; database and log paths are per instance |
| `{SITE}\web.config`, `{APP}\*.config` | Application-selected settings and connection strings |
| `%USERPROFILE%\.gitconfig`, `{PROJECT}\.git` | Development configuration/metadata |

Use [credential hunting](windows/credential-harvesting) and
[service/task ACL inspection](windows/services-and-tasks), not path presence alone,
to choose the next operation.

See [Windows Known Folders](https://learn.microsoft.com/en-us/windows/win32/shell/knownfolderid),
[Windows Setup logs](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/windows-setup-log-files-and-event-logs?view=windows-11),
and [WSL filesystems](https://learn.microsoft.com/en-us/windows/wsl/filesystems).
