---
title: Evil-WinRM task reference
order: 3
tags: [winrm, evil-winrm, powershell, kerberos, certificates, transfer]
---

Run connection commands on **Kali** and session commands inside the **Evil-WinRM
prompt**. Adapted from the supplied [Evil-WinRM reference](https://app.notion.com/413bbf9f0e7481f0beb2fb9a1ec2d78d)
and [upstream documentation](https://github.com/Hackplayers/evil-winrm).
Endpoint authorization is separate from SMB login or possession of a credential.

## Inspect the client

```bash
evil-winrm -V
evil-winrm -h
```

Check local help before using version-specific flags. Direct ticket input `-K`
requires v3.8 or later. `-N` disables remote-path completion when local Ruby/readline
support is incompatible; it does not change server access.

## Password and endpoint selection

Omit `-p` to use the password prompt. Qualify a local account with the target's
hostname or a domain account with its domain when the endpoint requires it.

```bash
evil-winrm -i '{{RHOST}}' -u '{{USER}}'
```

For a confirmed HTTPS listener:

```bash
evil-winrm -i '{{TARGET_FQDN}}' -u '{{DOMAIN}}\{{USER}}' -S -P 5986
```

`-P` selects the port; `-S` selects HTTPS. `-U` selects the configured endpoint
path, commonly `/wsman`. A TCP listener alone does not prove the WinRM endpoint.

## NT hash authentication

```bash
evil-winrm -i '{{RHOST}}' -u '{{USER}}' -H '{{NT_HASH}}'
```

Use the NT hash only, not LM:NT or a NetNTLMv2 response. Check account scope,
NTLM policy and endpoint permission if authentication fails.

## Kerberos ticket authentication

Use the actual FQDN, configured realm, valid ticket and synchronized time.

```bash
export KRB5CCNAME='{{TICKET_PATH}}'
klist -c "$KRB5CCNAME"
evil-winrm -i '{{TARGET_FQDN}}' -r '{{REALM}}'
```

For a client supporting direct ccache input, select this alternative:

```bash
evil-winrm -i '{{TARGET_FQDN}}' -r '{{REALM}}' -K '{{TICKET_PATH}}'
```

The HTTP SPN and account in the cache must fit the endpoint. Use the installed
client's `--spn` option only when the service uses a different confirmed prefix.

## Client certificate authentication

Use a certificate/private-key pair mapped to an authorized Windows identity.
HTTPS transport and client-certificate account mapping are separate requirements.

```bash
evil-winrm -i '{{TARGET_FQDN}}' -S -P 5986 -c '{{CERT_PATH}}' -k '{{KEY_PATH}}'
```

A PFX must first be exported to the expected files using the
[certificate conversion workflow](active-directory/attack-paths#certificate-schannel-fallback).
Keep the private key with the lab evidence.

## Identify the remote session

Inside Evil-WinRM:

```powershell
whoami /all
$env:COMPUTERNAME
Get-Location
Get-ChildItem
```

`menu` lists available client helpers, `services` lists the service information the
client can determine, and `exit` closes the session. Neither a prompt nor service
listing proves Administrator/SYSTEM access.

## Upload and download direction

Inside Evil-WinRM, LOCAL is the Kali filesystem and REMOTE is Windows. Use absolute
paths or current-directory filenames; upstream does not support arbitrary relative
transfer paths. Parent directories and permissions must already be suitable.

```text
upload {{LOCAL_FILE}} {{REMOTE_FILE}}
```

For the reverse direction:

```text
download {{REMOTE_FILE}} {{LOCAL_FILE}}
```

Compare [file hashes](shells/file-transfers#verify-a-transferred-file) on both hosts.
Use filenames without spaces unless the installed client's quoting behavior is
verified for that path.

## Local script and assembly directories

On Kali, point `-s` and `-e` to reviewed local files:

```bash
evil-winrm -i '{{RHOST}}' -u '{{USER}}' -s /home/kali/tools/binaries -e /home/kali/tools/binaries
```

Inside the session, invoke a staged supported script by its filename and inspect
`menu` for available functions. Local script discovery is not proof a target
runtime can execute a particular .NET assembly.

## Connection diagnostics

On an existing authorized Windows console:

```powershell
Get-Service WinRM
Get-ChildItem WSMan:\localhost\Listener
Get-PSSessionConfiguration
```

Inspect service, listeners and endpoint permissions separately. An initial HTTP
401 can be an authentication challenge. For timeouts check the route; for rejected
credentials check scope/method; for post-authentication denial check authorization.
[Microsoft WinRM configuration](https://learn.microsoft.com/en-us/windows/win32/winrm/installation-and-configuration-for-windows-remote-management).
