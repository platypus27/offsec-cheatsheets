---
title: Client-side security and browser trust
order: 6
tags: [browser, client-side, cookies, xss, csrf, cors, csp, origin]
---

Identify which client interprets the input. Follow how the browser renders it
and which trust boundary applies. See also [document and endpoint policy](windows/endpoint-protections).

## Origin and site

An origin consists of scheme, host and port. Cookie SameSite rules use sites,
which can span multiple origins. CORS governs whether browser scripts can access
cross-origin responses. Some requests can reach the server even when the browser
blocks the script from reading the response. Enforce authorization on the server.

## XSS and rendering context

Cross-site scripting occurs when untrusted data becomes active content. Reflected
input returns in the current response, stored input persists across requests,
and DOM-based cases arise from client-side processing. These dimensions can
overlap. Trace where data enters and where the app places it in the document.

Use safe text APIs, context-specific encoding, and a maintained sanitizer where
rich HTML is required. Content Security Policy adds an independent control.
Inspect the enforced policy separately from any report-only policy.

## CSRF and session boundaries

Cross-site request forgery relies on a browser sending credentials such as cookies
with an unwanted request. Use a framework-supported CSRF protection for
state-changing requests. SameSite limits some cookie delivery. Secure restricts
cookie delivery to secure transport, and HttpOnly limits script access to the
cookie value. Authorization still belongs on each operation.

## Read browser evidence

| Panel | What to record |
| --- | --- |
| Network | Request URL and origin, response status, redirect chain and relevant headers |
| Elements | Resulting DOM and where the input appears |
| Console | Browser policy error, including its directive or origin |
| Application | Cookie scope and flags or storage origin, with values removed from shared evidence |

Compare the original response with the final DOM before attributing behavior to
the server. See [OWASP XSS prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html),
[CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html),
and [session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
