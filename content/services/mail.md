---
title: Mail service enumeration
order: 5
tags: [smtp, pop3, imap, openssl, nmap, mail]
---

Run on **Kali** against a confirmed mail listener. These checks cover capability
and known-account access, not a blanket open-relay assumption.
[Field Manual service context](https://app.notion.com/413bbf9f0e74815a8c4fe95771f4b6c4).

## SMTP capabilities

```bash
nmap -sV -p '{{SMTP_PORT}}' --script smtp-commands '{{RHOST}}'
```

Check banner, EHLO capabilities and advertised auth/TLS behavior. Capability
advertisement does not prove that VRFY, EXPN or relay is permitted.
[Nmap smtp-commands](https://nmap.org/nsedoc/scripts/smtp-commands.html).

## SMTP STARTTLS

```bash
openssl s_client -starttls smtp -connect '{{RHOST}}:{{SMTP_PORT}}' -servername '{{MAIL_HOST}}' -crlf
```

After negotiation, send `EHLO {{CLIENT_NAME}}` to inspect capabilities. For an
implicit-TLS endpoint, omit `-starttls smtp` and use the confirmed TLS port.
Inspect certificate names/trust; `s_client` is a diagnostic tool whose verification
behavior differs from a validating application client. [OpenSSL s_client](https://docs.openssl.org/master/man1/openssl-s_client/).

## POP3 session

```bash
openssl s_client -connect '{{MAIL_HOST}}:995' -servername '{{MAIL_HOST}}' -crlf
```

Inside a confirmed implicit-TLS POP3 session, `CAPA` lists capabilities. Use the
known account with `USER`/`PASS` only when that authentication method is permitted;
`STAT`, `LIST`, `RETR` and `QUIT` refer to mailbox operations. Record the account
and message provenance; do not confuse message retrieval with code execution.

## IMAP capabilities

```bash
openssl s_client -connect '{{MAIL_HOST}}:993' -servername '{{MAIL_HOST}}' -crlf
```

Inside IMAP, send tagged commands such as `a1 CAPABILITY` and `a2 LOGOUT`.
Use the account's supported authentication method before mailbox inspection.
For STARTTLS on a cleartext IMAP endpoint, use `-starttls imap` with its port.
[OpenSSL protocol modes](https://docs.openssl.org/master/man1/openssl-s_client/).
