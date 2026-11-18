---
title: PEN-200 study map
order: 4
tags: [pen-200, syllabus, modules, theory, lab, quiz, challenge, study plan]
---

Use the map to choose a study topic before a practice session. Course pages
provide the full instruction and exercises. This guide groups reference pages
by study topic so the same notes can serve more than one module.

## Course topic map

| Study topic | Where to start |
| --- | --- |
| Program orientation and study habits | [Practice and review](exam-day/practice-review), [session preparation](field-guide/methodology#prepare-a-session) |
| Assessment scope, evidence and reporting | [Report checklist](reporting/report), [blank report outline](reporting/report-template) |
| Networking and gathering information | [Discovery concepts](recon/scanning), [service matrix](services/service-matrix), [network troubleshooting](troubleshooting/network) |
| Vulnerability assessment and advisories | [Review scanner and advisory findings](recon/vulnerability-review), [public exploit assessment](exploitation/public-exploits) |
| HTTP, APIs and browser security | [HTTP workflow](web/http-workflow), [client-side security](web/client-side-security), [web troubleshooting](troubleshooting/web) |
| Files, command input and SQL | [File and command inputs](web/file-and-command-input), [SQL concepts](web/manual-sqli), [database services](services/databases) |
| Client documents, public exploits and endpoint controls | [Document and endpoint protections](windows/endpoint-protections), [payload prerequisites](exploitation/payloads) |
| Authentication and password material | [Password and hash formats](passwords/cracking), [identity troubleshooting](troubleshooting/identity) |
| Windows host security | [Windows privileges](windows/windows-privesc), [services and tasks](windows/services-and-tasks), [Windows paths](reference/windows-paths) |
| Linux host security | [Linux privileges](linux/linux-privesc), [permissions and jobs](linux/permissions-and-jobs), [Linux paths](reference/linux-paths) |
| Port forwarding, network reachability and segmentation | [Endpoint roles](pivoting/forwarding), [tunnel troubleshooting](troubleshooting/tunnels) |
| Frameworks and restricted features | [Exam tool rules](exam-day/exam-day#tool-restrictions), [shell and transfer reference](shells/file-transfers) |
| Active Directory objects, authentication and movement | [Directory enumeration](active-directory/ad-enumeration), [Windows enumeration](active-directory/windows-enumeration), [AD control review](active-directory/defensive-review) |
| Challenge labs and exam preparation | [Practice review](exam-day/practice-review#review-a-challenge-session), [exam day](exam-day/exam-day) |

OffSec maintains the module and exam objectives. Use the
[PEN-200 learning plan](https://help.offsec.com/hc/en-us/articles/15541765522196-OffSec-PEN-200-Learning-Plan-12-Week)
and [OSCP+ Body of Knowledge](https://help.offsec.com/hc/en-us/articles/38543335188756-OSCP-Body-of-knowledge)
for the complete official topic list.

## Use theory, lab and reference notes

| Source section | How to use it |
| --- | --- |
| Learning Modules and Theory | Learn the model and write down what evidence would distinguish similar outcomes. Start with the topic map above. |
| Module Labs and Quizzes | Follow the exercise in the official portal. Record your own observations in Lab notebook and review the questions below. |
| Challenge Labs | Plan a timed practice session and review the gaps against your own evidence. |
| Cheat Sheets | Find context by heading search. Use Command explorer when you need the existing tool, service and phase filters. |
| Exam Desk and Evidence | Use [Exam day](exam-day/exam-day) and [Reporting](reporting/report) to rehearse the handoff from proof to report. |
| Archives and imported variants | Use the [source coverage ledger](field-guide/coverage#known-limits-to-retain) to find what was adapted and which material stays in the sources. |

## Questions to check your understanding

- Why can a server receive a request while the browser refuses to expose its
  response to script? Compare the [origin and request boundary](web/client-side-security#origin-and-site).
- What distinguishes an antivirus detection from a remediation action? Check
  [Defender events](windows/endpoint-protections#read-defender-and-policy-events).
- What collection details would make a missing directory graph edge inconclusive?
  Use the [BloodHound data quality review](active-directory/defensive-review#review-bloodhound-data-quality).
- Why can two processes report different mounts on the same Linux host? See
  [devices and mounts](reference/linux-paths#devices-mounts-and-backups).
- Which observations belong in the exam control panel and which in the PDF?
  Review [report packaging](reporting/report#package-and-upload) and
  [proof evidence](reporting/report#evidence).
