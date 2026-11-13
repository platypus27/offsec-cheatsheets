---
title: Windows privilege escalation
order: 1
tags: [windows, privesc, privileges, services, winpeas, acl]
---

## Situational awareness

```cmd
systeminfo
```

Record OS/build, architecture and host/domain context. [Microsoft systeminfo](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/systeminfo).

## Token privileges

```cmd
whoami /all
```

Record current identity, groups and token privileges. A listed privilege alone does not prove an available escalation. [Microsoft whoami](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/whoami).

## Automated enumeration

- [ ] Choose a WinPEAS release matching target architecture and runtime.
- [ ] [Transfer and verify](shells/file-transfers#verify-a-transferred-file), then review its help and findings.
- [ ] Confirm permissions on each proposed path manually.

TODO: verify the prepared WinPEAS filename and invocation; the C# build requires a compatible .NET runtime. [WinPEAS](https://github.com/peass-ng/PEASS-ng/blob/master/winPEAS/README.md), [C# requirements](https://github.com/peass-ng/PEASS-ng/blob/master/winPEAS/winPEASexe/README.md).

## Service paths and accounts

Run locally in Windows PowerShell:

```powershell
Get-CimInstance -ClassName Win32_Service | Select-Object Name,StartName,PathName,State
```

Check the service account, executable path, arguments and ability to trigger execution. [CIM query](https://learn.microsoft.com/en-us/powershell/module/cimcmdlets/get-ciminstance?view=powershell-7.5), [service properties](https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-service).

## File and directory ACLs

Replace .\tool.exe with the discovered task/service executable, then check its containing directory too.

```cmd
icacls ".\tool.exe"
```

A writable file matters only if a more privileged context uses it. An unquoted service path also needs a viable writable search location and execution trigger. [icacls](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/icacls), [unquoted path conditions](https://attack.mitre.org/techniques/T1574/009/).

## Scheduled tasks

```cmd
schtasks /query /fo LIST /v
```

Record task identity, action and trigger; check the action's file and directory ACLs. [Microsoft query options](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/schtasks-query).
