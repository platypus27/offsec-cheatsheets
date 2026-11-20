---
title: Coverage and source evidence
order: 2
tags: [coverage, sources, evidence, oscp, ad, index]
---

The [task index](field-guide/start#workflow-index) maps the Field Manual's 21
numbered phases. The [PEN-200 study map](field-guide/study-map) connects the course
topic families, theory, module exercises and challenge practice to this guide.

## Sources and adaptation

The 2026-11-18 review used the public [Field Manual](https://app.notion.com/413bbf9f0e748189b961d23104ab7509),
its workflow pages and synced command context, and the supplied
[OSCP course-note root](https://app.notion.com/335bbf9f0e74807582a0c363ed3c1275)
with its linked subject references. The manual's own
[coverage page](https://app.notion.com/413bbf9f0e7481a4aba7fbc6e4fd3b2c)
distinguishes imported, source-checked and needs-correction material.

The review snapshot contained 148 page records and 18,851 blocks, including
archives and repeated references. That inventory is limited to the captured
trees. It does not establish the contents of every database view or gallery, and
the current pass used that snapshot. Primary sources establish tool behavior and
exam requirements. Opening external source links requires a network connection.

## What each source contributes

| Source area | Guide coverage | Scope |
| --- | --- | --- |
| Field Manual phases 00-15 and 18-20 | [Workflow index](field-guide/start#workflow-index), [troubleshooting](troubleshooting/start), [path references](reference) | Section mappings, not a one-to-one import of each example |
| Field Manual tool and service cards, phases 16-17 | Command explorer and [service index](services/service-matrix) | The app groups existing commands by its own headings. Source card counts do not measure equivalence. |
| Root path tables | [Windows paths](reference/windows-paths), [Linux paths](reference/linux-paths) | System, storage, configuration, applications, development and desktop defaults with local caveats |
| Course theory and notes | [PEN-200 study map](field-guide/study-map#course-topic-map) | Topic map and original conceptual notes, including browser, endpoint, service and directory controls |
| Module labs, quizzes and challenge labs | [Practice review](exam-day/practice-review) and Lab notebook | Study prompts, response evidence and self-review. Exercises and answers stay in their original source. |
| Exam Desk and reporting template | [Exam day](exam-day/exam-day), [report outline](reporting/report-template), [submission checklist](reporting/report#package-and-upload) | Original template and checklist, with the current exam guide as authority |
| Archives, imports and study-only examples | Current notes and primary references | Historical layouts, duplicate examples, personal progress, transcripts and operational programs stay out of the guide. |

## AD task coverage

| Task | Working reference |
| --- | --- |
| Windows tool build and staging | [Rubeus, collectors and PowerView](active-directory/tool-preparation) |
| Domain/DC, users, policy and groups | [Kali enumeration](active-directory/ad-enumeration) |
| Native Windows, .NET and PowerView | [Windows enumeration](active-directory/windows-enumeration) |
| SharpHound CE and graph interpretation | [Collection](active-directory/windows-enumeration#sharphound-ce-collection), [edge verification](active-directory/windows-enumeration#interpret-a-graph-path) |
| Spraying, AS-REP and TGS recovery | [Credentials](active-directory/credential-access), [roasting](active-directory/kerberos) |
| Password/hash/certificate/ticket movement | [Access](active-directory/credential-access), [WinRM](services/winrm), [tickets](active-directory/tickets) |
| DCOM and execution rights | [DCOM](active-directory/credential-access#dcom-execution) |
| TGT acquisition, conversion, reuse and forgery | [Ticket workflows](active-directory/tickets) |
| ACLs, groups and cleanup | [Object operations](active-directory/attack-paths#acl-abuse-operations) |
| Constrained, unconstrained and RBCD | [Delegation](active-directory/delegation) |
| Capture, cracking and SMB relay | [Relay prerequisites](active-directory/relay) |
| ESC1/4/7/8 and shadow credentials | [AD CS](active-directory/attack-paths#ad-cs-enrollment-prerequisites) |
| Dumping, NTDS/IFM, DCSync, LAPS and gMSA | [Credential collection](active-directory/credential-dumping) |
| Local escalation and internal routing | [Windows](windows/windows-privesc), [pivoting](pivoting/tunnelling) |

The AD companion links these areas from outcome-based decisions. Conditional
service cards remain opt-in; scan recommendations do not establish prerequisites.

## Evidence levels

| Evidence | Meaning |
| --- | --- |
| Supplied reference | An example or explanation exists in the supplied notes |
| Source inspection | Relevant documentation/tool syntax was inspected; version and target caveats remain |
| Application validation | Parsed references, display, navigation, variable/copy behavior or persistence were exercised |
| Live lab validation | A technique ran against the matching lab target and its result was verified |

This update does **not** claim live AD or target exploitation validation. Record
your own target/build/tool version and result before treating a recipe as lab tested.

## Known limits to retain

- The source's numbered 19/20 pages were empty or nearly empty. The useful path
  material comes from its root path tables; reminders come from its workflow pages.
- The [browser](web/client-side-security) and [endpoint](windows/endpoint-protections)
  pages explain client-side and antivirus concepts. They cover trust, observable
  behavior and defensive controls. Payload and evasion procedures are outside
  this expansion.
- [H2 and FreeSWITCH](services/extra-services#h2-database-and-console) now have
  service and management context. BloodHound's [control review](active-directory/defensive-review)
  covers UI interpretation and data quality. Lab-specific chains, query libraries
  and full source programs remain outside this expansion.
- PowerSploit/PowerView is archived; native and CE-compatible alternatives are
  provided. Collector and tool compatibility must be checked locally.
- Exam rules and scoring can change. Check the
  [official guide](https://help.offsec.com/hc/en-us/articles/360040165632-OSCP-Exam-Guide)
  for your sitting. The lab reference includes exam-restricted automation.

## Maintain one command

Edit the original Markdown heading, then update `_recipes.yaml` metadata if its
tool/service/phase changes. Companions and explorer excerpts resolve that same
heading, keeping commands, prerequisites and corrections synchronized. A heading
rename also needs updates to incoming links, scan rules and companions.
