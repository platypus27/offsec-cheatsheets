---
title: File, command and upload inputs
order: 4
tags: [web, lfi, traversal, upload, command-injection, curl]
---

Adapted from [Web Attacks](https://app.notion.com/413bbf9f0e7481dfac9dd9951bad02ed).
Start from the real request, account and feature, then change one input.

## Traversal baseline

On Kali, use the observed file-selection endpoint and parameter. The example
value targets a Unix-like host; required depth and suffix handling vary.

```bash
curl -i -G '{{URL}}' --data-urlencode '{{FILE_PARAM}}=../../../../etc/passwd'
```

Confirm actual file contents and compare with the normal feature. A reflected
filename or generic server error does not establish arbitrary file read.
[OWASP traversal testing](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/05-Authorization_Testing/01-Testing_Directory_Traversal_File_Include).

## PHP filter read

For a confirmed PHP inclusion feature that accepts stream wrappers:

```bash
curl -i -G '{{URL}}' --data-urlencode '{{FILE_PARAM}}=php://filter/convert.base64-encode/resource={{PHP_FILE}}'
```

Decode the returned file content separately. Wrapper availability, application
prefixes and suffixes affect the result; reading PHP source does not demonstrate
server-side code execution. [PHP filter wrapper](https://www.php.net/manual/en/wrappers.php.php).

## Command injection baseline

Only for a feature that invokes an OS command, compare a benign identity probe
with the same input's normal output. This illustrates a Unix shell separator:

```bash
curl -i -G '{{URL}}' --data-urlencode '{{PARAM}}={{NORMAL_VALUE}};id'
```

Match the target OS and shell context. Avoid treating an error, echo or timing
change alone as execution proof. Confirm the actual returned process identity.
[OWASP command injection](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/12-Testing_for_Command_Injection).

## Upload storage and execution

- [ ] Capture the actual multipart field, filename, session and CSRF requirements.
- [ ] Submit a harmless prepared file and keep the request/response.
- [ ] Find the returned storage identifier and retrieve the file separately.
- [ ] Inspect Content-Type, Content-Disposition, renamed paths and rendering.
- [ ] Establish the interpreter/handler and execution context before a code test.

When the observed upload supports a straightforward multipart request:

```bash
curl -i -b '{{COOKIE_JAR}}' -F '{{UPLOAD_FIELD}}=@{{LOCAL_FILE}}' '{{UPLOAD_URL}}'
```

This omits application-specific token fields until observed. HTTP 200 does not
prove storage, retrieval or execution. [curl multipart](https://curl.se/docs/manpage.html), [OWASP upload testing](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/10-Business_Logic_Testing/08-Test_Upload_of_Unexpected_File_Types).
