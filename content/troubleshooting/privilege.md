---
title: Privilege-path failures
order: 4
tags: [troubleshooting, privesc, sudo, services, tasks, tokens]
---

## Linux permission paths

| Symptom | Condition to test |
| --- | --- |
| Allowed sudo command gives no shell | Exact executable, run-as identity, arguments, environment and privilege-drop behavior |
| SUID/capability binary stays unprivileged | Actual mode/owner/capability, mount flags, namespace and program behavior |
| Writable cron script has no effect | Job is active, privileged, uses that exact path/interpreter and has actually run |
| Relative-path replacement unused | Privileged consumer's PATH and working directory, not the current shell's |
| Kernel exploit compiles but fails | Target architecture, distribution patch/backport, ABI and runtime prerequisites |

Use [permissions and jobs](linux/permissions-and-jobs) for the minimal inspection
commands. Preserve the original lab state before any change.

## Windows permission paths

| Symptom | Condition to test |
| --- | --- |
| `sc qc` acts like a file command | Use `sc.exe`; inspect PowerShell alias resolution |
| Unquoted path gives no elevation | Writable candidate in the real parse sequence plus restart rights and privileged service identity |
| Service configuration changes but no output | Correct binPath quoting, start/stop state, service account and evidence file ACL |
| Writable task action never runs | Actual trigger, run-as identity, working directory, interpreter and task state |
| Elevated group present but operation denied | Integrity/token filtering, deny ACEs and exact requested right |
| Potato/impersonation variant fails | OS/build, architecture, runtime, enabled token privilege and required service/trigger |
| Installer policy lead fails | Both relevant policy values and the actual install context |

Use [service/task checks](windows/services-and-tasks) and
[token/variant prerequisites](windows/windows-privesc#impersonation-escalation).
Changing variants without identifying the missing condition obscures the cause.
[Supplied troubleshooting source](https://app.notion.com/413bbf9f0e7481ed9f82f28b8daafdf5).
