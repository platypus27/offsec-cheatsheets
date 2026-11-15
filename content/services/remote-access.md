---
title: Remote access
order: 4
tags: [winrm, rdp, windows]
---

## WinRM credential check

Use a known domain account. Explicit DOMAIN avoids NetExec's SMB domain lookup when SMB is unavailable. Current defaults probe HTTP/5985 and HTTPS/5986; check the endpoint reported in output.

```bash
nxc winrm {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}'
```

Look for successful authentication and access indication, then verify execution below. [NetExec authentication](https://www.netexec.wiki/winrm-protocol/authentication), [listener defaults](https://github.com/Pennyw0rth/NetExec/blob/main/nxc/protocols/winrm/proto_args.py).

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
xfreerdp3 /v:{{RHOST}}:{{RPORT}} /u:'{{USER}}' /p:'{{PASS}}'
```

Review the presented certificate before accepting a lab certificate exception.

[FreeRDP command-line reference](https://github.com/FreeRDP/FreeRDP/wiki/CommandLineInterface).

## WinRM hash and certificate authentication

Use the credential form actually recovered. NTHASH is the NT hash. For certificate authentication, PFX contains the certificate and private key; openssl converts it to the PEM files Evil-WinRM expects. Use -S for HTTPS.

```bash
evil-winrm -i {{RHOST}} -P {{RPORT}} -u '{{USER}}' -H '{{NTHASH}}'
openssl pkcs12 -in '{{PFX}}' -clcerts -nokeys -out client-cert.pem
openssl pkcs12 -in '{{PFX}}' -nocerts -nodes -out client-key.pem
evil-winrm -i {{RHOST}} -P {{RPORT}} -c client-cert.pem -k client-key.pem -S
```

Protect the exported key and verify the resulting identity. [Evil-WinRM authentication options](https://github.com/Hackplayers/evil-winrm), [OpenSSL pkcs12](https://docs.openssl.org/master/man1/openssl-pkcs12/).
