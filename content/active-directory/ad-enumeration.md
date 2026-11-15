---
title: AD enumeration
order: 1
tags: [ad, ldap, smb, netexec, bloodhound]
---

## Domain overview

```bash
nxc smb {{RHOST}}
```

Run against each domain machine in turn, switching the default profile so RHOST tracks the machine under test. Record hostname, domain label and signing status. The label may be NetBIOS; it does not prove a host is a DC. [Source](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-hosts).

## DNS SRV records

Set DOMAIN to the DNS domain and DC to its DNS server address.

```bash
dig @{{DC}} _ldap._tcp.dc._msdcs.{{DOMAIN}} SRV +short
```

Match returned hostnames to reachable DC addresses. [Microsoft discovery record](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/7fcdce70-5205-44d6-9c3a-260e616a2f04), [dig syntax](https://bind9.readthedocs.io/en/v9.18.33/manpages.html).

## Domain users

Requires a valid domain account. Target the domain controller with DC.

```bash
nxc ldap {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --users
```

[Source](https://www.netexec.wiki/ldap-protocol/enumerate-users).

## Domain groups

```bash
nxc ldap {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --groups
```

Append a discovered group name to list its members. Current documentation uses LDAP for this option. [Source](https://www.netexec.wiki/ldap-protocol/enumerate-group-members).

## Password policy

```bash
nxc smb {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --pass-pol
nxc ldap {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --pso
```

- [ ] Record lockout threshold and observation window before repeated logins.
- [ ] Check fine-grained policy applicability; the domain default may differ from an account's effective policy.

[Domain policy](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-domain-password-policy-1), [fine-grained PSOs](https://www.netexec.wiki/ldap-protocol/dump-pso).

## BloodHound CE collection

```bash
nxc ldap {{DC}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --bloodhound --collection All --dns-server {{DC}}
```

- [ ] Use CE ingestion and review collection errors before trusting missing paths.
- [ ] Verify All's methods for the installed NetExec version; it can contact member hosts and differs from SharpHound.
- [ ] Use [attack-path prerequisites](active-directory/attack-paths#acl-abuse) before acting on a graph edge.

[NetExec CE default](https://www.netexec.wiki/ldap-protocol/bloodhound-ingestor), [current method resolver](https://github.com/Pennyw0rth/NetExec/blob/main/nxc/protocols/ldap/bloodhound.py), [Python collector limits](https://github.com/dirkjanm/BloodHound.py).

## Anonymous LDAP naming contexts

Probe only when LDAP is reachable. An anonymous bind may reveal naming contexts without authenticating as a user.

```bash
ldapsearch -x -H 'ldap://{{DC}}' -s base namingcontexts
```

Use the returned domain DN as the base for later queries. Access denied is a result, not proof that LDAP is closed. [ldapsearch](https://www.openldap.org/software/man.cgi?query=ldapsearch).

## RPC null users and descriptions

When SMB/RPC permits a null session, request domain users and display information together. Descriptions and comments can contain useful operational clues.

```bash
rpcclient -N -U '' '{{RHOST}}' -c 'enumdomusers;querydispinfo'
```

Record valid usernames and useful description fields. Do not interpret NT_STATUS_ACCESS_DENIED as an empty domain. [NetExec null-session guidance](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-null-sessions), [Samba rpcclient](https://www.samba.org/samba/docs/current/man-html/rpcclient.1.html).

## Kerberos username enumeration

Use a reviewed users.txt with one candidate per line. Kerbrute userenum sends preauthentication requests and does not increment failed-login counts; password spraying is different and can lock accounts.

```bash
/home/kali/tools/kerbrute/kerbrute userenum --dc '{{DC}}' -d '{{DOMAIN}}' users.txt -o kerberos-users.txt
```

[Kerbrute user enumeration and lockout semantics](https://github.com/ropnop/kerbrute#user-enumeration).

## RID cycling with credentials

With a working SMB credential, resolve domain RIDs into account names. Save the output as users.txt after reviewing its format.

```bash
nxc smb {{RHOST}} -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' --rid-brute
```

[NetExec RID enumeration](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-users-by-bruteforcing-rid).

## TLS certificate identity

For an HTTPS or LDAPS service, inspect the certificate for DNS names, hostnames and CA naming clues. Set RPORT to the confirmed TLS listener and DOMAIN to a relevant hostname when SNI is required.

```bash
openssl s_client -connect '{{RHOST}}:{{RPORT}}' -servername '{{DOMAIN}}' </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -ext subjectAltName
```

Certificate names are leads to verify through DNS and service evidence. [OpenSSL s_client](https://docs.openssl.org/master/man1/openssl-s_client/), [x509](https://docs.openssl.org/master/man1/openssl-x509/).
