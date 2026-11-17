---
title: Web request failures
order: 2
tags: [troubleshooting, web, cookies, csrf, burp, upload, sqli]
---

## Request and application state

| Symptom | Smallest useful check | Likely boundary |
| --- | --- | --- |
| IP returns default site | Repeat using the discovered hostname and TLS SNI | Virtual host selection |
| Every fuzz path looks valid | Compare a random nonexistent route with a known route | Wildcard routing/custom error/filter calibration |
| Saved request returns login | Replay a fresh authenticated request unchanged | Cookie, token, Host or session expiry |
| API fails while browser works | Compare method, content type, headers and body with browser history | Request shape or CSRF state |
| SQL timing is inconsistent | Interleave repeated baseline and test requests | Jitter, server load, caching or query context |
| Upload returns 200 but no file | Retrieve the returned storage identifier independently | Storage path, auth or renamed file |
| File downloads rather than executes | Inspect handler, response headers and served path | Static storage or wrong execution surface |
| XSS probe renders as text | Inspect exact output/DOM context | Encoding or a non-executable context |
| Template arithmetic returns 49 | Compare with literal baseline and identify the engine | Evaluation is a lead, not automatic code execution |

## Replay before changing the payload

Use [Burp Repeater](web/http-workflow#save-and-replay-in-burp) to keep one known
working request. Record the one changed field and preserve both responses. Avoid
removing CSRF/session controls from the request just to make an automation tool run.

For the selected feature, continue to [manual SQL](web/manual-sqli),
[file/command inputs](web/file-and-command-input), or
[discovery calibration](web/http-workflow#calibrate-content-discovery).
[Supplied troubleshooting source](https://app.notion.com/413bbf9f0e7481ed9f82f28b8daafdf5).
