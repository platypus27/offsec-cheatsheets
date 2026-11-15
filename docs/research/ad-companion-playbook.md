# AD companion playbook research

Condensed 2026-11-15 from 16 public Hack The Box walkthroughs plus primary tool and vendor documentation. Purpose: evidence base for the Active Directory companion playbook (`content/_playbooks/active-directory.yaml`). No live-target commands were executed; no exam content is reproduced, only recurring methodology. The user's claim that Nmap and WinPEAS are unnecessary was tested against the walkthrough evidence instead of being assumed; the verdict is in the assessment section below.

Method note: all 16 walkthroughs were read in full from a single author (0xdf, first-person, retired machines). This gives consistent depth but is one author's habits; where a technique appears in only one or two walkthroughs it is marked as a minority path, not a universal one. Tool claims were followed to project or vendor documentation; claims already pinned in `kimi-k31-ad.md` and `source-evidence.md` are reused with their verified URLs rather than re-fetched.

## Sources

### HTB walkthroughs examined (16)

| Machine | Year | Scenario in one line | URL |
| --- | --- | --- | --- |
| Active | 2018 | SMB null session, GPP cpassword, Kerberoast, psexec | https://0xdf.gitlab.io/2018/12/08/htb-active.html |
| Forest | 2019 | RPC null enum, AS-REP roast, BloodHound ACL path to DCSync | https://0xdf.gitlab.io/2020/03/21/htb-forest.html |
| Resolute | 2019 | Password in RPC comment, one-password spray, DnsAdmins DLL | https://0xdf.gitlab.io/2020/05/30/htb-resolute.html |
| Sauna | 2020 | kerbrute userenum, AS-REP roast, WinPEAS finds AutoLogon, DCSync | https://0xdf.gitlab.io/2020/07/18/htb-sauna.html |
| Blackfield | 2020 | AS-REP roast, BloodHound.py, RPC password reset, LSASS dumps, SeBackupPrivilege | https://0xdf.gitlab.io/2020/10/03/htb-blackfield.html |
| Fuse | 2020 | cewl wordlist spray, smbpasswd change, RPC printer comment, SeLoadDriverPrivilege | https://0xdf.gitlab.io/2020/10/31/htb-fuse.html |
| Reel2 | 2020 | OWA spray, phish link, Responder NTLMv2, JEA escape, custom function abuse | https://0xdf.gitlab.io/2021/03/13/htb-reel2.html |
| Intelligence | 2021 | PDF metadata creds, AD CS (certipy) domain escalation | https://0xdf.gitlab.io/2021/11/27/htb-intelligence.html |
| Return | 2021 | Printer web panel leaks LDAP bind creds, Server Operators service abuse | https://0xdf.gitlab.io/2022/05/05/htb-return.html |
| Timelapse | 2022 | Cracked PFX to WinRM, PowerShell history, LAPS read | https://0xdf.gitlab.io/2022/08/20/htb-timelapse.html |
| Support | 2022 | SMB share tool with hardcoded LDAP creds, password in LDAP info field, RBCD | https://0xdf.gitlab.io/2022/12/17/htb-support.html |
| Escape | 2023 | MSSQL xp_dirtree coercion to Responder, AD CS ESC1 (Certify and certipy) | https://0xdf.gitlab.io/2023/06/17/htb-escape.html |
| Authority | 2023 | Ansible vault creds, PWM config-mode LDAPS capture, ESC1 for Domain Computers, PassTheCert | https://0xdf.gitlab.io/2023/12/09/htb-authority.html |
| Manager | 2023 | RID cycling, username-as-password spray, MSSQL xp_dirtree, ESC7 | https://0xdf.gitlab.io/2024/03/16/htb-manager.html |
| Certified | 2024 | Assume-breach start, WriteOwner to ESC9 via shadow credentials (BloodHound CE) | https://0xdf.gitlab.io/2025/03/15/htb-certified.html |
| Cicada | 2024 | Guest share default password, RID spray, description field creds, Backup Operators hive dump | https://0xdf.gitlab.io/2025/02/15/htb-cicada.html |

Support is authored by the walkthrough author himself (stated in the post), which makes it the closest thing to a machine-author walkthrough in the set; HTB's own per-machine official writeups sit behind the platform login and were not used. IppSec covers every machine above on YouTube and is a good second opinion for the same chains; Video content was not transcribed for this pass.

### Primary tool and vendor documentation

- Impacket examples (pinned in `kimi-k31-ad.md`): [GetNPUsers.py](https://github.com/fortra/impacket/blob/impacket_0_13_1/examples/GetNPUsers.py) (AS-REP requires `UF_DONT_REQUIRE_PREAUTH`), [GetUserSPNs.py](https://github.com/fortra/impacket/blob/impacket_0_13_1/examples/GetUserSPNs.py), [wmiexec.py](https://github.com/fortra/impacket/blob/impacket_0_13_1/examples/wmiexec.py).
- [NetExec wiki](https://www.netexec.wiki/): SMB/LDAP enumeration, [password policy](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-domain-password-policy-1), [password spraying and its lockout risk](https://www.netexec.wiki/smb-protocol/password-spraying).
- [Certipy README](https://github.com/ly4k/Certipy): AD CS toolkit covering ESC1 to ESC17 detection and abuse; per-command detail lives in its wiki.
- SpecterOps, [Certified Pre-Owned](https://posts.specterops.io/certified-pre-owned-d95910965cd2): canonical ESC1 to ESC8 conditions (enrollment rights, manager approval disabled, no authorized signatures, auth-capable EKU, `CT_FLAG_ENROLLEE_SUPPLIES_SUBJECT`; ESC7 ManageCA/ManageCertificates; ESC8 relay via MS-RPRN coercion with SpoolSample/Dementor).
- [Responder README](https://github.com/lgandx/Responder): LLMNR/NBT-NS/MDNS poisoner with rogue SMB/HTTP/LDAP/MSSQL/Kerberos servers; captures NetNTLMv2 (crack with hashcat mode 5600), cleartext LDAP binds, and AS-REQ material.
- [kerbrute README](https://github.com/ropnop/kerbrute): `userenum` sends TGT requests without preauth and does not cause lockouts (event 4768 only); `passwordspray` increments failed logins and will lock accounts (events 4768/4771); `--safe` aborts all threads on the first lockout.
- [PetitPotam README](https://github.com/topotam/PetitPotam): MS-EFSRPC (`EfsRpcOpenFileRaw`) coerced authentication, works without credentials against a DC; notes the incomplete fix under CVE-2021-36942.
- [MITRE ATT&CK T1558.004, AS-REP Roasting](https://attack.mitre.org/techniques/T1558/004/): unauthenticated AS-REQ yields AS-REP material encrypted with the account key, crackable offline.
- [Microsoft, Windows LAPS overview](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview): LAPS rotates local administrator passwords and lets authorized users retrieve them; legacy LAPS is deprecated on newer OS builds.
- [KB5014754](https://support.microsoft.com/en-us/servicing/os/windows-server/2022/05/kb5014754-certificate-based-authentication-changes-on-windows-domain-controllers) (pinned in `kimi-k31-ad.md`): certificate strong-mapping enforcement state decides whether issued certificates authenticate.
- [PEASS-ng README](https://github.com/peass-ng/PEASS-ng) (pinned in `source-evidence.md`): WinPEAS C# needs .NET 4.5.2 or newer.
- [Nmap reference manual](https://nmap.org/book/man.html) (pinned in `source-evidence.md`): host discovery, port specification, scan techniques, version detection, output.

### Exam-structural sources

- [Official OSCP exam guide](https://help.offsec.com/hc/en-us/articles/360040165632-OSCP-Exam-Guide) (pinned in `source-evidence.md`, page updated 2026-10-21): 23h45m plus 24h reporting window; proof via `cat`/`type` in an interactive shell; an AD set exists alongside standalone machines. Recheck per sitting.
- [OSCP vs OSCP+ (Hacker Blueprint)](https://hackerblueprint.com/blog/oscp-vs-oscp-plus), 2026-11-03: secondary confirmation that from 2024-11-01 the AD set is assume-breach (candidate starts with a standard domain user) and bonus points were removed. Matches the assume-breach framing of HTB Certified and Fluffy-class 2024/2025 boxes.
- [OSCP Takeaways in 2024 (Adin Drabkin)](https://adindrabkin.com/blog/oscp-takeaways-in-2024/), 2024-08-12: practitioner advice that every machine, AD included, deserves a complete port and service scan first. First-person, not OffSec official.

## Recurring paths and prerequisites

| Recurring path | Walkthrough evidence | Prerequisite before it works |
| --- | --- | --- |
| Full TCP scan, then `-sC -sV`/`-sCV` service detection on discovered ports; UDP pass on DCs | All 16 open with `nmap -p- --min-rate 10000`; explicit UDP scans in Active, Forest, Blackfield | None; SYN scan needs elevated privileges (already noted in the playbook) |
| Anonymous or guest SMB share read leading to credentials or tooling | Active (Replication share, Groups.xml), Support (support-tools), Timelapse (Shares), Cicada (HR notice), Authority (Development/Ansible), Escape (Public PDF) | Share allows anonymous or guest access; tool output still needs validation |
| SYSVOL/GPP `cpassword` extraction | Active (gpp-decrypt of Groups.xml) | Pre-2014 GPP residue; `services/common-services#sysvol` covers the search |
| Username enumeration without creds: RPC null session, RID cycling, Kerberos brute | Forest, Resolute, Fuse (rpcclient); Manager, Cicada (lookupsid.py, netexec `--rid-brute`); Sauna, Manager (kerbrute userenum) | Null SMB/RPC session allowed, or UDP/TCP 88 reachable; kerbrute userenum does not lock accounts |
| Passwords or hints in user description/comment fields | Resolute (RPC `querydispinfo`), Cicada (netexec `--users` LDAP description), Support (LDAP `info` field) | Any valid read access to SAMR or LDAP |
| One-password spray across many users | Resolute, Fuse, Cicada, Manager (SMB); Reel2 (OWA via SprayingToolkit) | Password policy checked first; netexec `--continue-on-success`; kerbrute `--safe` for Kerberos sprays |
| AS-REP roasting | Forest, Sauna, Blackfield | Known usernames plus `UF_DONT_REQUIRE_PREAUTH`; crack etype 23 with hashcat 18200 (pinned in `kimi-k31-ad.md`) |
| Kerberoasting | Active (Administrator SPN), recurring as a BloodHound-suggested option | Valid domain creds; enabled person account with SPN; etype 23 cracks as 13100 |
| WinRM as the primary shell | 13 of 16 (Forest, Sauna, Resolute, Fuse, Escape, Return, Support, Timelapse 5986, Authority, Certified, Manager, Cicada, Reel2) | Account in Remote Management Users or admins; listener 5985/5986 |
| BloodHound path analysis from any foothold | Forest, Sauna, Support, Certified, Blackfield (BloodHound.py from Kali) | Any valid creds; CE collector semantics per `kimi-k31-ad.md` |
| ACL path to DCSync or domain admin | Forest (GenericAll then WriteDacl then Add-DomainObjectAcl DCSync), Certified (WriteOwner then shadow credentials), Support (GenericAll on DC computer) | Effective permissions verified, not assumed; graph edge is a lead |
| Resource-based constrained delegation via machine account | Support (Powermad, Rubeus s4u), Authority (addcomputer.py, getST.py) | `ms-ds-machineaccountquota` above 0, write rights on a computer object, 2012+ DC (all verified in Support) |
| AD CS enumeration and ESC abuse | Escape (ESC1), Authority (ESC1 for Domain Computers, then PassTheCert when PKINIT failed), Certified (ESC9), Manager (ESC7), Intelligence | CA present; ESC conditions per SpecterOps; enrollment rights for the current principal; strong mapping state per KB5014754 |
| Coerced authentication captured by Responder | Escape (`xp_dirtree` UNC, NTLMv2 cracked as 5600), Reel2 (phish link), Authority (LDAP cleartext capture) | A service or user can be steered to the attacker; Responder rogue server on the right interface |
| DCSync with secretsdump | Forest, Sauna (and every DA-equivalent endgame) | DCSync rights (Replicating Directory Changes All); DC reachable on 445/135/RPC, shown in Forest Beyond Root |
| Hash reuse and pass-the-hash | Active, Forest, Sauna, Escape, Authority, Certified, Manager, Cicada (wmiexec, psexec, evil-winrm `-H`) | Administrator-level hash; execution method per host |
| OS-level privilege escalation | Fuse (SeLoadDriverPrivilege, Capcom.sys), Return (Server Operators, service binpath), Resolute (DnsAdmins `dnscmd` plugin DLL), Reel2 (JEA escape) | A foothold on a non-DC host; most DC-centric chains skip OS privesc entirely |
| SeBackupPrivilege to registry hives or ntds.dit | Cicada (`reg save` SAM/SYSTEM, `secretsdump.py -sam -system LOCAL`; diskshadow plus robocopy for ntds.dit), Blackfield (ntds.dit via backup rights) | Membership in Backup Operators; hives crack offline, ntds.dit needs a shadow copy or ntdsutil |
| LAPS read | Timelapse (`Get-ADComputer -property ms-mcs-admpwd` as LAPS_Readers) | Read permission on the LAPS attribute; per Microsoft docs retrieval is ACL-controlled |

## Assessment: the Nmap and WinPEAS claim

The claim under test: Nmap and WinPEAS are unnecessary for the AD companion.

Nmap: not supported by the evidence. All 16 walkthroughs open with a full TCP port scan, and 12 of 16 show the two-pass pattern the playbook already encodes (full port list first, then `-sC -sV` or `-sCV` on exactly the discovered ports). LDAP NSE output is the domain-identification source in most DC boxes (Active, Forest, Sauna, Return, Support, Escape, Manager, Certified, Cicada), and the ms-sql NTLM-info script is what surfaces domain and hostname on MSSQL boxes (Escape, Manager). Authority found its CA name from the TLS certificate exposed by the scan, and Escape flagged an 8-hour clock skew from scan output before Kerberos work. Public exam-experience guidance says the same for the OSCP itself: collect a full port and service scan of every machine before anything else. Treat Nmap as recurring required reconnaissance: keep the `scan` node as the single entry point, keep the UDP pass optional but recommended on DC-shaped targets (Active, Forest, Blackfield all ran full UDP scans).

WinPEAS: the claim is mostly supported, with nuance. WinPEAS appears explicitly in 2 of 16 walkthroughs (Sauna, Timelapse). In Sauna it surfaces AutoLogon credentials that the author then demonstrates are equally visible by reading the registry manually; in Timelapse the author checks the PowerShell history manually and notes WinPEAS would have shown the same. In the other 14 chains no OS-level privilege escalation tool is needed at all: escalation is domain-level (roasting, ACLs, AD CS, dumping) or comes from targeted manual checks (`whoami /priv`, `whoami /groups`, transcripts, sticky notes, LDAP fields, error logs). Treat WinPEAS as optional automation: keep it as one branch (as the playbook already does via the `winpeas` node and `windows/windows-privesc#automated-enumeration`), but the primary flow should be the targeted manual checks, because automation output was never the deciding evidence in any examined chain. Nuance worth keeping: when a shell exists and leads have dried up, one WinPEAS run is a cheap sweep, and its transfer depends on working file transfer plus .NET 4.5.2+ for the C# build (both already caveated in the notes).

Related tools verdict by the same evidence: crackmapexec appears throughout 2019 to 2023 writeups but the 2024 to 2025 writeups use netexec, the maintained successor (stated in Authority, which runs `netexec (formerly crackmapexec)`); the commands are interchangeable in the notes.

## Recommended companion graph

Coverage the evidence supports, keyed to where the graph should branch:

1. Anonymous and coerced enumeration before credentials: SMB null shares, RPC null session, RID cycling, kerbrute userenum, anonymous LDAP naming contexts, DNS zone transfer and SRV, TLS certificate inspection, and coerced authentication (UNC paths, MS-RPRN, MS-EFSRPC) feeding Responder. Evidence: Active, Forest, Resolute, Sauna, Manager, Cicada, Escape, Authority; coercion primitives per PetitPotam README and SpecterOps ESC8 section.
2. Service-confirmed authenticated enumeration: SMB shares per credential state, SYSVOL/GPP, LDAP users/groups/description fields, password policy and PSOs, Kerberos SPN and preauth flags, DNS records. Evidence: every walkthrough; the existing `services` node shape matches.
3. SMB, LDAP, Kerberos, DNS, RPC, WinRM, MSSQL and web as first-class service branches. MSSQL earned its own branch (xp_dirtree, xp_cmdshell, backup zips, config files) from Escape and Manager; web panels leaked credentials in Return, Fuse, Support and Authority.
4. Roasting (AS-REP and Kerberoast) with hash-mode discipline (18200, 13100, per `kerberos#kerberos-hash-modes`).
5. Password spraying with lockout controls: policy first (`ad-enumeration#password-policy`), one password across many users, netexec `--continue-on-success`, kerbrute `--safe`. Evidence: Resolute, Fuse, Cicada, Manager, Reel2.
6. Credential and hash reuse with authority checks (`credential-access#domain-or-local-login`, `#reuse-one-known-credential`, `#pass-the-hash`).
7. Shares, SYSVOL and GPP, and stored-credential hunting (`services/common-services#sysvol`, `windows/credential-harvesting`).
8. BloodHound collection and graph-led paths (`ad-enumeration#bloodhound-ce-collection`, `attack-paths#acl-abuse`), with the existing correction that edges are leads.
9. AD CS as a first-class branch: enumeration, ESC1/ESC7/ESC9-style abuse, certificate authentication, shadow credentials, PassTheCert fallback, strong-mapping check (`attack-paths#ad-cs-enrollment-prerequisites`, `#certificate-strong-mapping-after-2025`). Evidence: Escape, Authority, Certified, Manager, Intelligence.
10. Delegation prerequisites and RBCD execution path (`attack-paths#delegation-prerequisites`). Evidence: Support, Authority.
11. Local privilege escalation leads (`windows/windows-privesc`), including the niche-but-recurring privileged groups: Server Operators, DnsAdmins, Backup Operators, SeLoadDriverPrivilege.
12. Credential dumping: DCSync, LSASS or dump files, SAM/SYSTEM hives, ntds.dit via shadow copy, LAPS (`credential-dumping`, plus a LAPS gap noted below).
13. Pivoting and proof: keep the existing `pivot` and `proof` nodes; public single-DC walkthroughs do not exercise multi-host AD pivoting, so this stays sourced from the existing pivoting playbook.
14. PrintNightmare and ZeroLogon: demote to patch-state footnotes only. Zero of 16 examined chains used either, including boxes running vulnerable-era OS builds (Active is Server 2008 R2, Forest and Resolute are Server 2016). Do not spend graph nodes on them; note them inside host-assessment guidance instead.

## Proposed node-by-node flow

Command references use existing note headings from `content/`; heading names were verified against the current files. Gaps are marked and listed in the next section. The flow deliberately keeps the current playbook's spine (scan, domain, services, leads) because the evidence supports it; the deltas are additions.

1. `scan` (keep as is). Commands: `recon/scanning#port-scanning`, `#service-detection`, `#udp-scanning`, `#save-nmap-output`. Add as lookFor items: domain string from LDAP NSE output, MSSQL NTLM-info output, TLS certificate subject and issuer (CA names appear there), clock skew for Kerberos planning.
2. `domain` (keep). Commands: `active-directory/ad-enumeration#domain-overview`, `#dns-srv-records`. Add dig SRV and TLS-certificate inspection; certificate inspection has no heading (gap G2).
3. `anon-enum` (new node between `domain` and `services`): run without creds. SMB null and guest share list plus file grab (`services/common-services#smb`, `#sysvol`), RPC null `enumdomusers` and `querydispinfo` (gap G1), RID cycling via lookupsid or netexec `--rid-brute` (gap G1), kerbrute userenum (gap G1), anonymous LDAP naming contexts (`active-directory/ad-enumeration#domain-users` requires creds today, gap G1), DNS zone transfer (`services/network-services#dns-zone-transfer`). Exit when any lead (user list, share file, password) is saved.
4. `services` (expand the existing checkbox node): keep SMB, WinRM, LDAP, DNS; add `mssql` (1433, match ms-sql-s) with `services/databases#mssql` and `#mssql-command-execution`; add `web` (80/443) with `web/web-enumeration#content-discovery` and credential-interception guidance (gap G3); add a `coerce` option anywhere MSSQL or RPC is present: UNC path, PrinterBug or PetitPotam to Responder (gap G3, primitives per PetitPotam README and SpecterOps).
5. `spray` (branch from `services`, replaces ad-hoc spraying): check `active-directory/ad-enumeration#password-policy` first, then `active-directory/credential-access#password-spraying`; one password across all users, continue on success; Kerberos variant with kerbrute `--safe` (gap G1 for the command). Evidence: Resolute, Fuse, Cicada, Manager.
6. `roast` (keep): `active-directory/kerberos#as-rep-roasting` needs only usernames; `#kerberoasting` needs valid creds; `#kerberos-hash-modes` before cracking. Evidence: Forest, Sauna, Blackfield, Active.
7. `access` (replaces/merges `winrm`): `services/remote-access#winrm-credential-check`, `#winrm-verify-identity`, `#winrm`; add variants shown by the walkthroughs: HTTPS 5986 with `-S` (Timelapse), certificate and key auth with `-c`/`-k` (Timelapse), hash auth with `-H` (Cicada, Certified, Manager, Escape). All three variants already work with the current WinRM commands but are not called out; add them as body text, no new headings needed.
8. `host-enum` (replaces/renames `winpeas`): manual first per `windows/windows-privesc#situational-awareness` (whoami, groups, privileges), `windows/credential-harvesting#common-locations` and `#application-data-files` (PowerShell history, transcripts, sticky notes, AutoLogon, config files, error logs). WinPEAS stays as the optional branch (`windows/windows-privesc#automated-enumeration` with the file-transfer headings `shells/file-transfers#serving-files`, `#downloading-on-windows`, `#verify-a-transferred-file`). This matches the evidence: manual checks decided 14 of 16 chains; WinPEAS is the sweep when leads run dry.
9. `graph` (branch from any authenticated state): `active-directory/ad-enumeration#bloodhound-ce-collection`; record collector and version per the `kimi-k31-ad.md` correction. Evidence: Forest, Sauna, Support, Certified, Blackfield.
10. `path` (keep, expand): `active-directory/attack-paths#acl-abuse`; add the recurring execution chain observed: owneredit.py then dacledit.py then group add (Certified), Add-DomainObjectAcl DCSync (Forest), RPC password reset (Blackfield), shadow credentials via certipy shadow (Certified). Commands partially absent (gap G4).
11. `delegate` (split out of `path`): `active-directory/attack-paths#delegation-prerequisites`; execution via Powermad New-MachineAccount plus Rubeus s4u, or addcomputer.py plus getST.py (Support, Authority). Commands absent (gap G5).
12. `certificates` (keep, expand): `active-directory/attack-paths#ad-cs-enrollment-prerequisites`; add certipy find/req/auth and Certify request flows for ESC1, ESC7 and ESC9 patterns, plus PassTheCert via LDAPS Schannel when PKINIT fails (Authority, per the SpecterOps Schannel note), plus shadow credentials (Certified). Check `#certificate-strong-mapping-after-2025` before assuming certificate auth succeeds. Commands absent (gap G6).
13. `dump` (keep, expand): `active-directory/credential-dumping#secretsdump-remotely` (DCSync), `#mimikatz-logon-passwords`, `#secretsdump-from-hives`, `#crack-cached-logons`, `#crack-a-protected-archive`; add ntds.dit via diskshadow/robocopy or ntdsutil (Cicada), LAPS read for local admin (Timelapse, Microsoft LAPS docs), dump-file parsing with pypykatz (Blackfield). LAPS and ntds.dit flows lack headings (gap G7).
14. `privesc` (replaces the winpeas-only escalation view): `windows/windows-privesc#token-privileges` and `#impersonation-escalation` for service-account shells (Escape Beyond Root used a Potato-class path); plus group-specific leads as lookFor items: Server Operators service binpath (Return), DnsAdmins dnscmd plugin DLL (Resolute), SeLoadDriverPrivilege vulnerable driver (Fuse), SeBackupPrivilege hive and ntds.dit paths (Cicada, Blackfield). Niche group-abuse commands lack headings (gap G8).
15. `reuse` (keep): `active-directory/credential-access#reuse-one-known-credential`, `#remote-windows-command`, `#pass-the-hash`, `#kerberos-authentication`.
16. `pivot` and `proof` (keep): `pivoting/tunnelling#ligolo-ng-tunnel`, `#scan-through-a-tunnel`, `#chisel-reverse-socks`; `reporting/report#evidence`. Honest gap: the 16 single-DC walkthroughs do not exercise multi-host AD pivoting, so these nodes stay validated only by the existing pivoting playbook and exam-day notes.

## Gaps to close before implementation

Implementation status after the companion rebuild: G1, G2 and G3 are closed with anonymous/RPC/Kerberos/LDAP, TLS identity, Responder and MSSQL UNC sections. G6 now has Certipy find, ESC1 req/auth and shadow-credential commands; other ESC classes remain condition-specific. G7 has DCSync and LAPS commands, while ntds.dit collection remains host-specific guidance. G8 is represented by privileged-group prerequisite guidance. G4 and G5 intentionally remain evidence-led guidance for arbitrary ACL/RBCD operations rather than presenting one generic mutation command as universally valid.

- G1: no note headings for unauthenticated username enumeration (kerbrute userenum, lookupsid/netexec RID cycling, rpcclient null enumdomusers/querydispinfo) or for the anonymous LDAP naming-context probe. Highest-value gap; it is the entry move in 6 of 16 chains.
- G2: no heading for TLS certificate inspection as a domain and CA discovery source.
- G3: no headings for coerced-authentication capture (Responder setup, UNC/MS-RPRN/MS-EFSRPC triggers) or for credential interception from web panels (Return, Authority pattern).
- G4: ACL abuse commands (owneredit, dacledit, group membership, RPC password reset, shadow credentials) exist only as guidance prose under `attack-paths#acl-abuse`.
- G5: delegation/RBCD execution commands (New-MachineAccount, s4u, getST) absent; only prerequisites exist.
- G6: AD CS command flows (certipy find/req/auth/shadow/account/ca, Certify find/request, PassTheCert) absent; only prerequisites and strong-mapping guidance exist.
- G7: LAPS read and ntds.dit exfiltration (diskshadow/robocopy, ntdsutil) have no headings under `credential-dumping`.
- G8: privileged-group abuse recipes (Server Operators, DnsAdmins, SeLoadDriverPrivilege, Backup Operators) have no headings; they appear in walkthroughs but would be lookFor prose at best in an OSCP-scope app.
- TODO: verify current netexec module names for `--rid-brute`, `--users`, `laps`, and `ntdsutil` against the installed version; walkthroughs used netexec 2023 to 2025 releases.
- TODO: verify certipy is packaged as `certipy-ad` and Certify availability in the user's toolchain before adding commands (Authority and Manager install it via pipx).

## Out of scope for the companion

Client-side phishing with document attachments (Reel, Reel2) and JEA custom-command abuse (Reel2) are real AD techniques but do not match the OSCP AD set's service-based entry points; leave them out of the playbook. ZeroLogon and PrintNightmare stay as patch-state notes only, per the evidence above. Azure or Entra-specific paths (Monteverde-style) were not examined and are not claimed here.
