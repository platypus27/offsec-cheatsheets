---
title: Checklist
order: 1
tags: [methodology, checklist, foothold, enumeration]
---

## Recon

- [ ] Record target scope, addresses, hostnames and domain names.
- [ ] Complete [TCP and UDP scans](recon/scanning#port-scanning); enumerate detected services.

## Initial access

- [ ] Check [web content and vhosts](web/web-enumeration#content-discovery), shares and readable configuration files.
- [ ] Record the entry point, working command and resulting account.

## Privilege escalation

- [ ] Stabilize the [shell](shells/shells#upgrading-a-shell).
- [ ] Follow [Linux](linux/linux-privesc#sudo-permissions) or [Windows](windows/windows-privesc#token-privileges) checks.

## Post-exploitation

- [ ] Retest found credentials with their [correct authority](active-directory/credential-access#domain-or-local-login).
- [ ] Enumerate again from each new foothold; [pivot](pivoting/tunnelling#port-forwarding) when required.

## Proof

- [ ] Capture [proof and target identity](reporting/report#evidence) immediately.
- [ ] Record enough commands and output to reproduce the path.

## Stuck with no new leads

- [ ] Return to untested services, hostnames, shares, backups and credential reuse.
- [ ] Record what failed and the next specific check before switching targets.

Workflow adapted into a checklist from the [supplied notes](https://github.com/BuilderGoh/OSCP-Master-Cheatsheet).
