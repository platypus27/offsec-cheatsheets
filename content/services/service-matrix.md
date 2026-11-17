---
title: Services by port
order: 0
tags: [ports, services, enumeration, index]
---

Confirm the actual protocol and hostname, not just its customary port. This index
adapts [Services by Port](https://app.notion.com/413bbf9f0e74815a8c4fe95771f4b6c4).
Use Scan parser for suggestions and Command explorer for tool variants.

## Network and remote access

| Common port | Service | First useful evidence |
| --- | --- | --- |
| 21 | [FTP](services/common-services#ftp) | Banner, anonymous access, readable files and write location |
| 22 | [SSH](services/common-services#ssh) | Host key, account/key type, logon and forwarding rights |
| 23 | Telnet | Confirm plaintext terminal protocol; use only a known lab account |
| 53 TCP/UDP | [DNS](services/network-services#dns-zone-transfer) | Authoritative names, forward/reverse records and zone-transfer policy |
| 69 UDP | [TFTP](services/extra-services#tftp-transfer) | Exact known filename and direction; no directory-listing assumption |
| 111 / 2049 | [RPC/NFS](services/network-services#nfs-exports) | Export paths, clients, NFS version and UID mapping |
| 135 | [RPC/DCOM](active-directory/credential-access#dcom-execution) | Endpoint mapper plus negotiated RPC reachability and execution rights |
| 139 / 445 | [SMB](active-directory/smb-enumeration) | Domain/local scope, signing, shares, files and effective permissions |
| 161 UDP | [SNMP](services/network-services#snmp-community-walk) | Version, community/credentials and returned system/application data |
| 873 | [rsync](services/extra-services#rsync-modules) | Published modules, read/write rights and backing path |
| 3389 | [RDP](services/remote-access#rdp) | Account scope, network-level authentication and remote logon rights |
| 5985 / 5986 | [WinRM](services/winrm) | HTTP versus HTTPS endpoint, authentication and endpoint authorization |

## Web, mail and databases

| Common port | Service | First useful evidence |
| --- | --- | --- |
| 80 / 443 / 8000 / 8080 / 8443 | [HTTP/S](web/http-workflow) | Correct Host/SNI, routes, session and application behavior |
| 25 / 465 / 587 | [SMTP](services/mail#smtp-capabilities) | Banner, EHLO capabilities and STARTTLS/implicit TLS distinction |
| 110 / 995 | [POP3](services/mail#pop3-session) | Transport mode, known-account login and mailbox access |
| 143 / 993 | [IMAP](services/mail#imap-capabilities) | Capabilities, transport mode and authorized mailbox scope |
| 1433 | [MSSQL](services/databases#mssql) | SQL versus Windows auth, current login, roles and databases |
| 3306 | [MySQL](services/databases#mysql) | Account, schema rights and server context |
| 5432 | [PostgreSQL](services/databases#postgresql) | Initial database, current user and permissions |
| 6379 | [Redis](services/extra-services#redis-inspection) | Authentication, ACLs and selected database; no write assumption |
| 3128 / 8080 | [HTTP proxy](services/extra-services#http-proxy-check) | Proxy protocol, auth policy and permitted destinations |

## Directory services

| Common port | Service | First useful evidence |
| --- | --- | --- |
| 88 / 464 | [Kerberos](active-directory/kerberos) | Realm/KDC, time, usernames, encryption type and ticket scope |
| 389 / 636 | [LDAP/LDAPS](active-directory/ad-enumeration) | RootDSE, naming context, bind identity, TLS, signing and channel binding |
| 3268 / 3269 | Global Catalog | Forest search scope and requested attributes; not a full domain LDAP replica |
| 9389 | AD Web Services | Confirm the service and an authenticated management requirement |
| 80 / 443 on a CA | [AD CS enrollment](active-directory/attack-paths#ad-cs-enrollment-prerequisites) | CA/template publication, enrollment/management rights and strong mapping |

Nonstandard ports still need the correct client. See [service identification
failures](troubleshooting/network) when a port is open but the expected protocol fails.
