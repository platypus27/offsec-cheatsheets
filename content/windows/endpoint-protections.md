---
title: Windows document and endpoint protections
order: 5
tags: [windows, defender, antivirus, asr, amsi, macros, motw, event viewer]
---

A document, script or program may be stopped by several independent controls.
Record the effective policy and the event that explains the outcome.

## Document trust

Windows can attach Mark of the Web to files from untrusted zones. Microsoft 365
Apps can use that origin information, publisher trust and policy to decide
whether macros may run. Behavior depends on application, version and settings.
Windows Library files describe locations for Explorer. Treat unexpected libraries
or document links as untrusted references and inspect the source and file type.

## Static, behavior and script inspection

| Control | What it observes |
| --- | --- |
| Static and reputation checks | File content, signatures and reputation before or during access |
| Behavior monitoring | Process activity and relationships as programs run |
| AMSI | Content submitted by participating script hosts and applications to an antimalware provider |
| Attack surface reduction (ASR) | Defined behaviors, such as Office spawning child processes, under configured block, audit or warn policy |
| Application control | Whether a program or script is admitted under a trust policy |

Controls can make independent decisions on the same file. A successful static
scan says little about what a process will do after launch.

## Read Defender and policy events

In Event Viewer, open **Applications and Services Logs > Microsoft > Windows >
Windows Defender > Operational**. Compare the time, affected path, user and
process with your observation. Event 1116 records a detection, while 1117 records
an action and its outcome. Match the threat and process details before linking
events. Compare ASR audit or block details with the named rule and policy mode.
For application control, inspect the relevant Code Integrity or AppLocker log.

See [Office macro policy](https://learn.microsoft.com/en-us/microsoft-365-apps/security/internet-macros-blocked),
[Defender event IDs](https://learn.microsoft.com/en-us/defender-endpoint/troubleshoot-microsoft-defender-antivirus),
and [ASR rules](https://learn.microsoft.com/en-us/defender-endpoint/attack-surface-reduction).
