---
title: HTTP, Burp and application state
order: 0
tags: [web, http, curl, burp, cookies, csrf, authentication]
---

Run command examples on **Kali**; use Burp and the browser to capture the actual
request. Adapted from [Web Attacks](https://app.notion.com/413bbf9f0e7481dfac9dd9951bad02ed).
Do not replace an observed route with a guessed exploit endpoint.

## Baseline request

```bash
curl -i '{{URL}}'
curl -i --resolve '{{WEB_HOST}}:443:{{RHOST}}' 'https://{{WEB_HOST}}/'
```

Record scheme, hostname, port, redirects, status, headers and response body.
`--resolve` preserves Host and TLS SNI. Keep certificate verification enabled and
verify the lab CA if TLS validation fails. [curl manual](https://curl.se/docs/manpage.html).

## Save and replay in Burp

1. Browse the real feature and capture its request in Proxy history.
2. Send it to Repeater and replay it unchanged until the baseline works.
3. Identify the method, path, parameter location, content type, cookie and CSRF state.
4. Change one input and compare status, headers, content, redirect and timing.
5. Save the request, matching response and interpretation with the target evidence.

A browser session can renew cookies or tokens that a saved request cannot.
Check that boundary before blaming the payload. [Burp Repeater documentation](https://portswigger.net/burp/documentation/desktop/tools/repeater).

## Cookie-backed requests

Use a current session cookie file for the lab account. Login routes and CSRF token
extraction are application-specific; obtain them from a working browser request.

```bash
curl -i -b '{{COOKIE_JAR}}' -c '{{COOKIE_JAR}}' '{{URL}}'
```

Confirm the response is the authenticated feature rather than an HTTP 200 login
page. Preserve redirect behavior when comparing results. Cookie jars can contain
secrets; do not commit them. [curl cookie options](https://curl.se/docs/manpage.html).

## Parameter encoding

Use the observed parameter name and endpoint. This sends one encoded GET value:

```bash
curl -i -G '{{URL}}' --data-urlencode '{{PARAM}}={{VALUE}}'
```

For an observed form-encoded POST, use the matching method and body instead:

```bash
curl -i '{{URL}}' --data-urlencode '{{PARAM}}={{VALUE}}'
```

JSON, multipart, path and header inputs need their own request encoding. Encoding
a payload twice can change its meaning. [curl data options](https://curl.se/docs/manpage.html).

## Calibrate content discovery

Request a random nonexistent path and compare its response with the root and
known routes. Measure wildcard status, size, words and redirects before adding
filters. Review one candidate manually before increasing the scan volume.

Use [ffuf/feroxbuster](web/web-enumeration#content-discovery) and
[virtual-host checks](web/web-enumeration#virtual-hosts) with the confirmed hostname.
A filtered response is not proof that the route does not exist.

## Select the input test

| Observed behavior | Next reference |
| --- | --- |
| Database-dependent lookup | [Boolean comparison and manual SQL](web/manual-sqli) |
| File/preview/download parameter | [Traversal and inclusion](web/file-and-command-input) |
| Server-side process or utility input | [Command injection](web/file-and-command-input#command-injection-baseline) |
| Upload and later retrieval | [Upload workflow](web/file-and-command-input#upload-storage-and-execution) |
| User input rendered into a page | Identify HTML/attribute/script/DOM context before choosing an XSS test |
| Session or role mismatch | Compare the same resource under the intended identities and capture authorization evidence |

[OWASP web testing guide](https://owasp.org/www-project-web-security-testing-guide/).
