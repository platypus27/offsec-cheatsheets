---
title: Identity and network glossary
order: 3
tags: [glossary, ad, kerberos, network, authentication]
---

## Credential material

| Term | Meaning in this reference |
| --- | --- |
| Password | Plaintext secret for a specific account authority; special characters still need correct shell quoting |
| NT hash | Password-derived NT value; supported NTLM authentication is a separate question from possession |
| NetNTLMv2 | Challenge-response capture with context; not the NT hash passed to `-H` |
| DCC2 | Cached domain-logon verifier for offline recovery; not a reusable NT hash |
| TGT | Ticket for requesting service tickets within its realm and validity |
| Service ticket | Ticket for a service identity/SPN; not a general-purpose password |
| ccache / kirbi | Ticket container formats; conversion does not change identity or rights |
| PFX | Certificate plus private-key container; issuance does not prove authentication |
| SPN | Directory service identity that must match the service being requested |

## Access boundaries

Authentication establishes an identity. Authorization determines the permitted
operation. Execution verifies that an intended command actually ran. A login
success marker, remote prompt and returned `whoami` are different observations.

Local accounts belong to a machine's authority; domain accounts belong to AD.
Local administrator, domain administrator, certificate manager and replication
permissions are distinct. An enabled group name or privilege is a lead until the
effective token and target right are verified.

## Endpoint roles

| Name | Role |
| --- | --- |
| RHOST | The working target from the default machine profile |
| DC | Controller IP derived from DC01; a member server is not automatically a DC |
| LHOST | Shared operator address reachable from the target |
| Target FQDN | Service hostname used for DNS, TLS SNI and Kerberos as appropriate |
| Listener | Socket accepting a connection at a specific bind address and port |
| Forward | Mapping that exposes a destination through an intermediate host |
| SOCKS | Application proxy; raw packets and all DNS lookups do not automatically use it |

See [tickets](active-directory/tickets), [credential formats](passwords/cracking)
and [endpoint mapping](pivoting/forwarding) for the working procedures.
