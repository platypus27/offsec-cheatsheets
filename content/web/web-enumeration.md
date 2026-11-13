---
title: Web enumeration
order: 1
tags: [web, http, ffuf, vhost, enumeration]
---

## Content discovery

Prepare words.txt for the observed app; use relevant extensions rather than a blanket list.

```bash
ffuf -w words.txt -u 'http://{{RHOST}}:{{RPORT}}/FUZZ' -ac
```

- [ ] Compare a known missing path and verify interesting results manually.
- [ ] Inspect discovered backups, configuration files and authentication pages.

Automatic calibration can filter responses; review its effect. [ffuf help](https://github.com/ffuf/ffuf).

## Virtual hosts

vhosts.txt contains bare labels. DOMAIN is the known base domain.

```bash
ffuf -w vhosts.txt -u 'http://{{RHOST}}:{{RPORT}}/' -H 'Host: FUZZ.{{DOMAIN}}' -ac
```

Verify a candidate against the default response. For HTTPS, also check [hostname resolution and SNI](web/web-enumeration#https-hostname-and-sni). [Source](https://github.com/ffuf/ffuf).

## Technology fingerprinting

```bash
curl -i 'http://{{RHOST}}:{{RPORT}}/'
```

- [ ] Browse the app; inspect redirects, page source, scripts and visible CMS/version clues.
- [ ] Check robots.txt and sitemap.xml.
- [ ] Follow [input tests](web/input-tests#sql-injection-comparison) using actual routes and parameters.

[curl options](https://curl.se/docs/manpage.html), [supplied video workflow](https://www.youtube.com/watch?v=JEjhP1wCUgo) (public description).

## HTTPS hostname and SNI

Map DOMAIN to RHOST while keeping the hostname in the HTTPS request.

```bash
curl -i --resolve '{{DOMAIN}}:{{RPORT}}:{{RHOST}}' 'https://{{DOMAIN}}:{{RPORT}}/'
```

Certificate verification remains enabled. TODO: verify the lab certificate before choosing any exception. [Source](https://curl.se/docs/manpage.html).
