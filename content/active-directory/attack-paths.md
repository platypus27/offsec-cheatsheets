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
