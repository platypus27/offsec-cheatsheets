# AD source and provenance record

Checked 2026-11-14. Research only, with no live-target validation. Undated pages below are current syntax references, not dated 2025 publications.

**Model/session proof:** session ce9f5537-93e2-40f4-9213-6ac0a982e027 startup log records `provider=openai model=k3.1-pro modelAlias=kimi-code/k3.1-pro`; its profile.bind entry confirms the alias. The coordinator independently checked the startup log and rendered model label.

## Supplied sources

- [BuilderGoh OSCP Master Cheatsheet](https://github.com/BuilderGoh/OSCP-Master-Cheatsheet): topic leads only, no prose copied. [Metadata](https://api.github.com/repos/BuilderGoh/OSCP-Master-Cheatsheet) reports no license and last push 2026-09-29. Do not import broad spraying or legacy collector advice unchanged.
- [Supplied video](https://www.youtube.com/watch?v=JEjhP1wCUgo): web enumeration, not an AD authority.

## NetExec and Impacket evidence

NetExec current primary documentation verifies [SMB host/domain/signing output](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-hosts), [authenticated DC listing](https://www.netexec.wiki/ldap-protocol/dc-list), [DNS overrides](https://www.netexec.wiki/getting-started/dns-options), [users](https://www.netexec.wiki/ldap-protocol/enumerate-users), [groups](https://www.netexec.wiki/ldap-protocol/enumerate-group-members), [shares](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-shares-and-access), [password policy](https://www.netexec.wiki/smb-protocol/enumeration/enumerate-domain-password-policy-1), [PSOs](https://www.netexec.wiki/ldap-protocol/dump-pso), [local versus domain authentication](https://www.netexec.wiki/smb-protocol/authentication/checking-credentials-local), and [admin-only command execution](https://www.netexec.wiki/smb-protocol/command-execution/execute-remote-command). SMB output alone does not prove a DC or DNS FQDN. Default domain policy does not exclude fine-grained policies. Targeted reuse avoids the documented [lockout risk](https://www.netexec.wiki/smb-protocol/password-spraying).

Pinned Impacket 0.13.1 sources verify [AS-REP prerequisites and formats](https://github.com/fortra/impacket/blob/impacket_0_13_1/examples/GetNPUsers.py), [Kerberoast request/output behavior](https://github.com/fortra/impacket/blob/impacket_0_13_1/examples/GetUserSPNs.py), and [WMI shell admin/DCOM requirements](https://github.com/fortra/impacket/blob/impacket_0_13_1/examples/wmiexec.py). AS-REP requires enabled `UF_DONT_REQUIRE_PREAUTH`; ordinary Kerberoasting requires authentication and an enabled person account with an SPN. [Hashcat modes](https://hashcat.net/wiki/doku.php?id=example_hashes): AS-REP etype 23 is 18200; TGS etypes 23/17/18 are 13100/19600/19700. Targeted Kerberoasting with SPN writes is not read-only enumeration.

## BloodHound CE coverage correction

Collection semantics are collector- and version-specific. [NetExec main lines 126-140](https://github.com/Pennyw0rth/NetExec/blob/main/nxc/protocols/ldap/bloodhound.py#L126-L140) define `all_methods` including `loggedon` and `adcs`. The [v1.5.1 file](https://github.com/Pennyw0rth/NetExec/blob/v1.5.1/nxc/protocols/ldap/bloodhound.py) has no such local resolver. Standalone [BloodHound.py CE](https://github.com/dirkjanm/BloodHound.py/tree/bloodhound-ce) still documents `All` excluding `LoggedOn` and no GPO local-group support. Record collector/version and inspect actual help/source; never make a universal `All` claim.

[SharpHound CE](https://bloodhound.specterops.io/collect-data/ce-collection/sharphound) is the official CE collector. Legacy `bloodhound-python` and CE `bloodhound-ce-python` are distinct. [Collection permissions](https://bloodhound.specterops.io/collect-data/sharphound-data-permissions) vary: local groups, sessions, CA registry and DC registry can be missing without privileged collection.

## Hardening and graph decisions

- [SMB signing](https://learn.microsoft.com/en-us/windows-server/storage/file-server/smb-signing): Windows 11 24H2 Enterprise/Pro/Education require inbound and outbound signing; Server 2025 requires outbound signing by default. `signing:False` is only one relay prerequisite.
- [LDAP channel binding](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/ldap-channel-binding) applies to TLS plus SASL, not simple bind or non-TLS SASL. New Server 2025 deployments default to `When supported`, not `Always`; [new deployments require LDAP signing](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/ldap-signing), while upgrades can preserve policy.
- [KB5014754](https://support.microsoft.com/en-us/servicing/os/windows-server/2022/05/kb5014754-certificate-based-authentication-changes-on-windows-domain-controllers): February 2025 moved DCs to Full Enforcement by default; after 2025-09-09 the compatibility override is unsupported. Certificate issuance alone does not prove authentication; verify strong mapping/SID extension.
- Graph edges are leads, not exploit proof. Check [object-specific ACL rights and inheritance](https://bloodhound.specterops.io/resources/edges/generic-all), [delegation type plus sensitive/Protected Users restrictions](https://bloodhound.specterops.io/resources/edges/coerce-to-tgt), and [AD CS enrollment, SAN, CA publication and NT Auth trust](https://bloodhound.specterops.io/resources/edges/adcs-esc1), alongside registry collection and certificate mapping.

## Dated releases and licenses

- [NetExec v1.5.1](https://github.com/Pennyw0rth/NetExec/releases/tag/v1.5.1), 2026-02-23, BSD-2-Clause.
- [BloodHound CE v9.9.2](https://github.com/SpecterOps/BloodHound/releases/tag/v9.9.2), 2026-11-06, Apache-2.0; [SharpHound v2.18.0](https://github.com/SpecterOps/SharpHound/releases/tag/v2.18.0), 2026-11-12, GPL-3.0.
- [BloodHound CE Python 1.9.1](https://pypi.org/project/bloodhound-ce/1.9.1/), 2025-10-24, MIT.
- [Impacket 0.13.1](https://github.com/fortra/impacket/releases/tag/impacket_0_13_1), 2026-05-19, [modified Apache Software License 1.1](https://github.com/fortra/impacket/blob/impacket_0_13_1/LICENSE), not stock Apache-2.0.

## Remaining TODOs

- TODO: verify the offline host's authorized time-sync client/command; Microsoft documents five-minute recommended Kerberos skew in [MS-KILE](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kile/c427eaf8-72ae-4e4d-aeea-109263de7eee).
- TODO: verify AES AS-REP cracker support rather than forcing output into 18200.
- TODO: recheck installed tool/collector versions and current page dates before publication.
