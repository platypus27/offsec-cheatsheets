---
title: Remote access
order: 4
tags: [winrm, rdp, windows]
---

## WinRM checks and shell

Check the credential, verify execution, then open an interactive shell when WinRM rights exist. Current NetExec defaults probe HTTP/5985 and HTTPS/5986; add -S for HTTPS.

```bash
nxc winrm {{RHOST}} -u '{{USER}}' -p '{{PASS}}'
nxc winrm {{RHOST}} -u '{{USER}}' -p '{{PASS}}' -X whoami
evil-winrm -i {{RHOST}} -P {{RPORT}} -u '{{USER}}' -p '{{PASS}}'
```

Record the returned identity; an SMB or WinRM login alone does not prove the intended rights. In an Evil-WinRM shell, use `upload` and `download` for files. [NetExec WinRM authentication](https://www.netexec.wiki/winrm-protocol/authentication), [NetExec command execution](https://www.netexec.wiki/winrm-protocol/command-execution), [Evil-WinRM](https://github.com/Hackplayers/evil-winrm).

## RDP

Requires remote logon rights. Authenticate and verify the session identity.

```bash
xfreerdp3 /v:{{RHOST}}:{{RPORT}} /u:'{{USER}}' /p:'{{PASS}}'
```

Review the presented certificate before accepting a lab certificate exception. [FreeRDP command-line reference](https://github.com/FreeRDP/FreeRDP/wiki/CommandLineInterface).

## WinRM hash and certificate authentication

Use the credential form actually recovered. NTHASH is the NT hash. For certificate authentication, PFX contains the certificate and private key; openssl converts it to the PEM files Evil-WinRM expects. Use -S for HTTPS.

```bash
evil-winrm -i {{RHOST}} -P {{RPORT}} -u '{{USER}}' -H '{{NTHASH}}'
openssl pkcs12 -in '{{PFX}}' -clcerts -nokeys -out client-cert.pem
openssl pkcs12 -in '{{PFX}}' -nocerts -nodes -out client-key.pem
evil-winrm -i {{RHOST}} -P {{RPORT}} -c client-cert.pem -k client-key.pem -S
```

Protect the exported key and verify the resulting identity. [Evil-WinRM authentication options](https://github.com/Hackplayers/evil-winrm), [OpenSSL pkcs12](https://docs.openssl.org/master/man1/openssl-pkcs12/).
