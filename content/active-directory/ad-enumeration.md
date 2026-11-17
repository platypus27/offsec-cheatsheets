---
title: AD enumeration
order: 1
tags: [ad, ldap, smb, netexec, bloodhound]
---

## Identify domain and DC

Run against each domain machine in turn, switching the default profile so RHOST tracks the machine under test. Record hostname, domain label and signing status.

```bash
nxc smb {{RHOST}}
dig @{{DC}} _ldap._tcp.dc._msdcs.{{DOMAIN}} SRV +short
```

The SMB label may be NetBIOS and does not prove a host is a DC. Match DNS SRV results to reachable controller addresses. [NetExec host enumeration](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-hosts), [Microsoft discovery record](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/7fcdce70-5205-44d6-9c3a-260e616a2f04).

## Enumerate accounts without credentials

Try SMB, RPC, Kerberos and LDAP independently. A failure on one protocol says nothing about the others. Save verified names as users.txt before spraying or roasting.

```bash
nxc smb {{RHOST}} -u '' -p '' --shares
nxc smb {{RHOST}} -u guest -p '' --shares
rpcclient -N -U '' '{{RHOST}}' -c 'enumdomusers;querydispinfo'
/home/kali/tools/kerbrute/kerbrute userenum --dc '{{DC}}' -d '{{DOMAIN}}' users.txt -o kerberos-users.txt
ldapsearch -x -H 'ldap://{{DC}}' -s base namingcontexts
```

Descriptions and comments can contain useful operational clues. Kerbrute userenum sends preauthentication requests and does not increment failed-login counts. [NetExec null sessions](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-null-sessions), [Samba rpcclient](https://www.samba.org/samba/docs/current/man-html/rpcclient.1.html), [Kerbrute user enumeration](https://github.com/ropnop/kerbrute#user-enumeration), [ldapsearch](https://www.openldap.org/software/man.cgi?query=ldapsearch).

## Enumerate accounts with credentials

Use the account's actual authority. SMB and LDAP can both return users; use both when one is denied or incomplete.

```bash
nxc smb {{RHOST}} -u '{{USER}}' -p '{{PASS}}' --users
nxc ldap {{DC}} -u '{{USER}}' -p '{{PASS}}' --users
nxc smb {{RHOST}} -u '{{USER}}' -p '{{PASS}}' --rid-brute
```

Record returned usernames, descriptions and RID evidence. Failure on one protocol does not prove the domain has no users. [NetExec SMB users](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-domain-users), [NetExec LDAP users](https://www.netexec.wiki/ldap-protocol/enumerate-users), [NetExec RID enumeration](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-users-by-bruteforcing-rid).

## Enumerate groups and members

Target a confirmed DC with a valid domain credential. Start with high-value groups, then investigate groups found in BloodHound or ACL output.

```bash
nxc ldap {{DC}} -u '{{USER}}' -p '{{PASS}}' --groups
nxc ldap {{DC}} -u '{{USER}}' -p '{{PASS}}' --groups 'Domain Admins'
nxc ldap {{DC}} -u '{{USER}}' -p '{{PASS}}' --groups 'Remote Management Users'
```

Group membership explains access better than a flat user list. Save memberships that connect a user to a host, delegation right, privileged group or certificate enrollment right. [NetExec group enumeration](https://www.netexec.wiki/ldap-protocol/enumerate-group-members).

## Password policy and Kerberos controls

Check lockout controls before repeated logins. Fine-grained policies can differ from the domain default.

```bash
nxc smb {{DC}} -u '{{USER}}' -p '{{PASS}}' --pass-pol
nxc ldap {{DC}} -u '{{USER}}' -p '{{PASS}}' --pso
```

Record the lockout threshold and observation window before spraying. [Domain password policy](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-domain-password-policy-1), [fine-grained PSOs](https://www.netexec.wiki/ldap-protocol/dump-pso).

## BloodHound CE collection

```bash
nxc ldap {{DC}} -u '{{USER}}' -p '{{PASS}}' --bloodhound --collection All --dns-server {{DC}}
```

Use CE ingestion and review collection errors before trusting missing paths. Verify All's methods for the installed NetExec version; it can contact member hosts and differs from SharpHound. Treat graph edges as leads, not proof. [NetExec CE default](https://www.netexec.wiki/ldap-protocol/bloodhound-ingestor), [Python collector limits](https://github.com/dirkjanm/BloodHound.py).

## TLS certificate identity

For an HTTPS or LDAPS service, inspect the certificate for DNS names, hostnames and CA naming clues. Set RPORT to the confirmed TLS listener and DOMAIN to a relevant hostname when SNI is required.

```bash
openssl s_client -connect '{{RHOST}}:{{RPORT}}' -servername '{{DOMAIN}}' </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -ext subjectAltName
```

Certificate names are leads to verify through DNS and service evidence. [OpenSSL s_client](https://docs.openssl.org/master/man1/openssl-s_client/), [x509](https://docs.openssl.org/master/man1/openssl-x509/).
