---
title: Start with the exact symptom
order: 0
tags: [troubleshooting, stuck, errors, methodology]
---

Adapted from the supplied [Troubleshooting and I'm Stuck](https://app.notion.com/413bbf9f0e7481ed9f82f28b8daafdf5).
Keep the exact error, host, identity, run location, command/request and time. Change
one condition and repeat the smallest operation that can test the hypothesis.

## Choose the failed boundary

| Symptom | Continue |
| --- | --- |
| Host silent, port filtered, protocol hangs, DNS fails | [Network and discovery](troubleshooting/network) |
| Wrong virtual host, stale session, noisy fuzzing, upload does not execute | [Web requests](troubleshooting/web) |
| Password/hash rejected, login without shell, Kerberos/LDAP/graph failure | [Identity and AD](troubleshooting/identity) |
| Sudo, service, scheduled job or impersonation path fails | [Privilege paths](troubleshooting/privilege) |
| Tunnel control works but destination/callback fails | [Tunnels](troubleshooting/tunnels) |
| Transfer corrupt, executable fails, terminal loses echo | [Shells and files](troubleshooting/shells) |

## No concrete lead remains

Review the [service matrix](services/service-matrix) for a confirmed service left
untested. Revisit names, readable files, descriptions, backups and the credentials
already collected. Check a new identity or network position for changed access.
Write a specific next check in Lab notebook before launching another broad scan.

## Record the resolution

Record the original symptom, smallest check, confirmed cause, successful command
and remaining limitation. A workaround that restores one request does not prove
every dependent workflow works. Return to the relevant companion with that evidence.
