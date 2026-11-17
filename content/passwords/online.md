---
title: Online authentication checks
order: 1
tags: [passwords, hydra, netexec, spraying, authentication]
---

Run from **Kali** only after confirming the service and authentication policy.
Adapted from [Password Cracking and Brute Force](https://app.notion.com/413bbf9f0e7481dc9190e8cbe61668b7).

## Policy and attempt ledger

- [ ] Determine domain/local authority, valid user names and intended service.
- [ ] Read lockout threshold, observation window and reset policy where available.
- [ ] Count attempts across every tool/session; concurrency multiplies failures.
- [ ] Confirm success/failure indicators with a known baseline.
- [ ] Stop on lockout/rate limits and record any successful host/service pair.

Low thread counts do not guarantee safety from lockout. For AD use the
[policy query](active-directory/ad-enumeration#password-policy-and-kerberos-controls)
and [spraying workflow](active-directory/credential-access#password-spraying).

## SSH password check

For an authorized lab with an explicit candidate list and attempt budget:

```bash
hydra -l '{{USER}}' -P '{{PASSWORD_LIST}}' -s '{{SSH_PORT}}' -t 1 -f '{{RHOST}}' ssh
```

`-f` stops the host's job after a success, not after one failure. Password and
keyboard-interactive behavior can differ. [Hydra usage and modules](https://github.com/vanhauser-thc/thc-hydra).

## HTTP form validation

First replay a known failed and known successful request in Burp. Confirm current
cookies, tokens, redirects and a reliable failure marker. If tokens rotate per
attempt, a static form string is not a complete automation procedure.

```bash
hydra -U http-post-form
```

Use the installed module's syntax with the observed route, field names and marker.
Keep application-specific requests in your evidence. A constant content length or
HTTP 200 can classify every login incorrectly. [Hydra HTTP form module](https://github.com/vanhauser-thc/thc-hydra/blob/master/hydra-http-form.c).

## Validate one recovered credential

```bash
nxc smb '{{RHOST}}' -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}'
```

Use [local authentication](active-directory/credential-access#domain-or-local-login)
for a local account. Verify WinRM, RDP or execution authorization independently
before recording a foothold. Never pass a NetNTLM capture as an NT hash.
