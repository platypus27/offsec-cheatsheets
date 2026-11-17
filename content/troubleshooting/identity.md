---
title: Credentials, Kerberos and AD failures
order: 3
tags: [troubleshooting, authentication, kerberos, ldap, bloodhound, winrm]
---

## Separate the identity stages

| Symptom | First check | Continue |
| --- | --- | --- |
| Recovered password rejected | Account authority, intended host/service, freshness and shell quoting | [Domain/local login](active-directory/credential-access#domain-or-local-login) |
| Login succeeds, shell denied | That service's logon/execution right | [WinRM](services/winrm#connection-diagnostics), [DCOM](active-directory/credential-access#dcom-execution) |
| Hash tool rejects input | Full prefix, separators, extraction and provenance | [Credential formats](passwords/cracking#choose-the-format) |
| Pass-the-hash fails with a capture | Whether the input is an NT hash or NetNTLM response | [Relay/capture distinction](active-directory/relay#capture-or-relay-decision) |
| Account locks/rate limits | Stop and reconcile all concurrent attempts | [Attempt ledger](passwords/online#policy-and-attempt-ledger) |
| Kerberos clock skew | Compare local and confirmed KDC time | [Clock query and step](active-directory/kerberos#kerberos-dns-or-clock-failure) |
| Kerberos principal not found | Realm, hostname, SPN and account type | [Ticket workflows](active-directory/tickets) |
| `KDC_ERR_BADOPTION` on delegation | Allowed SPN, protocol transition, forwardability and protected-user policy | [Delegation](active-directory/delegation) |
| LDAP bind/search empty | Bind identity/method, base DN, TLS and permissions | [Directory enumeration](active-directory/ad-enumeration) |
| BloodHound import fails | Edition, collector version and supported output format | [SharpHound CE](active-directory/windows-enumeration#sharphound-ce-collection) |
| Graph lacks sessions/admin edges | Collection errors, host reachability and method permissions | [Graph interpretation](active-directory/windows-enumeration#interpret-a-graph-path) |
| Member-server admin cannot DCSync | Actual domain replication rights | [DCSync prerequisites](active-directory/credential-dumping#dcsync-through-the-domain-controller) |
| Certificate issued, auth fails | Private key, identity/SID, mapping and PKINIT/Schannel support | [Certificate fallback](active-directory/attack-paths#certificate-schannel-fallback) |

## Inspect before retrying

On Kali, inspect the actual active ticket cache:

```bash
printf '%s\n' "$KRB5CCNAME"
klist
```

On Windows, inspect the current session's token and tickets separately:

```cmd
whoami /all
klist
```

A credential accepted by one protocol does not prove another service accepts it.
Record the complete error and the server that returned it before requesting or
importing another ticket. [Microsoft klist](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/klist), [supplied troubleshooting](https://app.notion.com/413bbf9f0e7481ed9f82f28b8daafdf5).
