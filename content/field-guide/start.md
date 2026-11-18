---
title: Start from your task
order: 0
tags: [workflow, field-manual, oscp, methodology, index]
---

Choose the next action from the evidence you have. The reference follows the
supplied [OSCP Field Manual](https://app.notion.com/413bbf9f0e748189b961d23104ab7509)
and [course notes](https://app.notion.com/335bbf9f0e74807582a0c363ed3c1275).
Commands are reference material for your authorized study environment. Application
checks validate navigation and content integrity; they do not certify a technique
against a particular target.

## Choose a starting point

| What you have | Next action |
| --- | --- |
| A fresh Kali machine | Open Setup in the sidebar, then [prepare a target folder](recon/workspace). |
| An IP or existing scan | [Discover services](recon/scanning), then paste output in Scan parser. |
| An open port | Use the [service matrix](services/service-matrix) and confirm the protocol. |
| A tool or command in mind | Open Command explorer; combine tool, service, phase and text filters. |
| A web application | [Capture a baseline request](web/http-workflow), then test the observed input. |
| A shell | [Stabilize the session](shells/shells), verify identity, then enumerate the host. |
| A credential or hash | [Identify the material](passwords/cracking), then test its intended authority. |
| A domain account | Start the AD companion, or [enumerate AD](active-directory/ad-enumeration). |
| A Linux foothold | [Inspect permissions](linux/linux-privesc), jobs and [credential stores](linux/credential-hunting). |
| A Windows foothold | [Establish identity](windows/windows-privesc), then [trace a service path](windows/services-and-tasks). |
| An internal-only service | [Draw the tunnel endpoints](pivoting/forwarding), then test the destination. |
| An error or no progress | Use [troubleshooting by symptom](troubleshooting/start). |
| A proof or completed target | [Capture evidence](reporting/report) and update Lab notebook. |
| A course module to revise | Use the [PEN-200 study map](field-guide/study-map) and [practice review](exam-day/practice-review). |

## Workflow index

| Manual phase | Working reference |
| --- | --- |
| 00 - Attack flow | [Methodology and lead selection](field-guide/methodology) |
| 01 - Setup and listeners | [Workspace](recon/workspace), [listeners](shells/shells#listeners) |
| 02 - Scanning | [Recon passes and interpretation](recon/scanning), [vulnerability finding review](recon/vulnerability-review) |
| 03 - Services | [Ports and service matrix](services/service-matrix) |
| 04 - Web | [HTTP/Burp workflow](web/http-workflow), [input tests](web/input-tests), [manual SQL](web/manual-sqli), [browser trust](web/client-side-security) |
| 05 - Exploits and client-side | [Exploit assessment](exploitation/public-exploits), [payload prerequisites](exploitation/payloads), [endpoint protections](windows/endpoint-protections) |
| 06 - Shells and transfer | [Shells](shells/shells), [file transfers](shells/file-transfers), [WinRM](services/winrm) |
| 07 - Passwords | [Format, extract and crack](passwords/cracking), [online checks](passwords/online) |
| 08 - Credential hunting | [Linux](linux/credential-hunting), [Windows](windows/credential-harvesting) |
| 09 - Linux privilege escalation | [Baseline](linux/linux-privesc), [permissions and jobs](linux/permissions-and-jobs) |
| 10 - Windows privilege escalation | [Baseline and token paths](windows/windows-privesc), [services/tasks](windows/services-and-tasks) |
| 11 - AD enumeration | [Kali](active-directory/ad-enumeration), [Windows and graphs](active-directory/windows-enumeration), [control review](active-directory/defensive-review) |
| 12 - AD attacks and movement | [Access](active-directory/credential-access), [tickets](active-directory/tickets), [ACLs/AD CS](active-directory/attack-paths), [delegation](active-directory/delegation), [relay](active-directory/relay) |
| 13 - Pivoting | [Tunnels](pivoting/tunnelling), [forwarding and endpoint roles](pivoting/forwarding) |
| 14 - Reporting | [Evidence and upload](reporting/report), [blank outline](reporting/report-template) |
| 15 - Lab tracker | Open Lab notebook in the sidebar and use the [practice review](exam-day/practice-review#review-a-challenge-session). |
| 16 - Commands by tool | Open Command explorer and choose Tool. |
| 17 - Commands by service | Open Command explorer and choose Service. |
| 18 - Troubleshooting | [Symptom index](troubleshooting/start) |
| 19 - Common paths | [Linux paths](reference/linux-paths), [Windows paths](reference/windows-paths) |
| 20 - Important points | [Methodology](field-guide/methodology), [exam-day checks](exam-day/exam-day) |

## Use the workspace effectively

- Press **v** to select the working machine. Browsing another profile does not
  change the default until you choose Make default.
- Set My IP to the address the target can reach. DC01 supplies the shared DC IP.
- Open Command values inside a command for advanced fields such as SPN, file path
  or hash. Values substitute literally; preserve shell quoting.
- Use **/** to find a heading directly. Pin useful notes and resume companions from
  home. Findings stay with the companion, profile and target address.
- Record one next action in Lab notebook before changing targets. Export each
  target's notes and keep proof files outside the browser.

## Evidence and scope

Read [coverage and source limits](field-guide/coverage) for what was adapted and
what remains contextual. Check the [official exam guide](https://help.offsec.com/hc/en-us/articles/360040165632-OSCP-Exam-Guide)
for current permitted tools and submission requirements before each sitting.
The lab reference includes automation that may be restricted in an exam.
