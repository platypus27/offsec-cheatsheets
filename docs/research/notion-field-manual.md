# Notion field manual review - 2026-11-18

## Source access and scope

The supplied roots are public in the browser:

- [OSCP Field Manual](https://app.notion.com/413bbf9f0e748189b961d23104ab7509).
- [OSCP OffSec Certified Professional](https://app.notion.com/335bbf9f0e74807582a0c363ed3c1275).

The web reader could not open the app.notion.com links. Orca's browser rendered
them, and anonymous Notion content reads retrieved the workflow pages, their
synced context and reachable subject-page trees. Temporary review files are under
`/tmp/offsec-notion-review`; no cookies, account tokens or credentials were used.
The retrieved tree contained 148 page records and 18,851 blocks with no unresolved
child-content references. That is a retrieval inventory, not a claim that every
database view or every workspace page was exhaustively enumerated. Collection
galleries can contain additional entries beyond their inline appearances.

Reviewed structure: phases 00-18; the root's Windows/Linux path tables; source and
coverage notes; exam quick reference; linked AD, host, password, web, exploit and
pivot subject notes. The second root organizes Learning Modules, Labs/Quizzes,
Challenge Labs and Cheat Sheets. Lab-specific exercise answers and personal
progress were not copied into generic recipes.

## Material differences from the app

The source offers task, tool, service and symptom entry points. The starting app
had heading search, profile-aware commands, setup and companions, but no filtered
command catalogue or portable per-target notebook. Its AD checkpoint contained an
intentional failing test for missing native enumeration, tickets, DCOM, delegation
and relay; that failure was independently reproduced before implementation.

The implementation adds those entry points and missing AD material, plus broader
web/password/Linux/Windows/exploit/pivot/path references. The catalogue points to
the original authored headings and renders their context instead of duplicating
commands. Source page introductions are retained with heading excerpts. Notebook
exports contain the selected target's manual fields, not all browser data.

The source reports 283 shared recipes, 76 tool cards and 35 service cards. Those
source counts are not the app's counts or a quality certification: its coverage
page labels most entries Imported and ten Needs correction. The app's independently
authored catalogue groups commands differently and does not blindly import those
records. The source's chapters 19/20 are empty or nearly empty; useful paths were
adapted from the root's expanded tables instead.

## Source checks and corrections

- [Impacket examples](https://github.com/fortra/impacket/tree/master/examples):
  checked ticket/delegation/DCOM/DACL option semantics. Fixed DN addressing to
  `-target-dn`; separated alternative writes, backups and restoration. Ticket
  reuse uses the reported cache filename rather than assuming it.
- [Certipy ESC documentation](https://github.com/ly4k/Certipy/wiki/06-%E2%80%90-Privilege-Escalation):
  completed ESC7 request-ID/private-key retention, approval, retrieval, auth and
  role/template restoration. Distinguished Manage CA from Manage Certificates.
- [Rubeus](https://github.com/GhostPack/Rubeus),
  [SharpHound CE flags](https://bloodhound.specterops.io/collect-data/ce-collection/sharphound-flags),
  [Kali collector package](https://www.kali.org/tools/sharphound/): retained
  execution location, collector compatibility, permissions and collection gaps.
- [Hashcat examples](https://github.com/hashcat/hashcat/blob/master/docs/hashcat-example-hashes.md):
  resolved AES AS-REP modes 32100/32200 and the DCC2 format, without claiming those
  values are NT hashes for pass-the-hash.
- [NTPsec ntpdig](https://docs.ntpsec.org/latest/ntpdig.html): separated the
  read-only query from privileged local-clock stepping; no clock was changed.
- [Evil-WinRM](https://github.com/Hackplayers/evil-winrm): cross-checked the supplied
  v4.1 task reference, authentication/transport distinctions, transfer direction,
  ticket-version caveat and endpoint authorization.
- [Kali BloodHound](https://www.kali.org/tools/bloodhound/),
  [PowerSploit package](https://www.kali.org/tools/powersploit/): setup stages
  packaged collectors/scripts at fixed paths and directs users to the matching
  CE collector. PowerSploit remains explicitly archived.
- [OpenSSL](https://docs.openssl.org/master/man1/openssl-s_client/),
  [Redis CLI](https://redis.io/docs/latest/develop/tools/cli/),
  [rsync](https://download.samba.org/pub/rsync/rsync.1): supporting service checks
  distinguish reachability, protocol, identity and actual permissions.
- [Official exam guide](https://help.offsec.com/hc/en-us/articles/360040165632-OSCP-Exam-Guide):
  retained the interactive proof requirement and linked current restrictions;
  SQLMap remains labeled a lab reference with a manual SQL alternative.

## Open-source approach comparison

Inspected [tlrc](https://github.com/tldr-pages/tlrc) and
[GTFOBins](https://github.com/GTFOBins/GTFOBins.github.io) before adding lookup:
both expose maintained upstream projects and explicit licenses (tlrc MIT;
GTFOBins GPL-3.0). The useful patterns are task-centered entries, function/context
filters and concise prerequisites. tlrc's downloadable/cache model would add a
runtime content lifecycle; GTFOBins' Jekyll/catalogue implementation would replace
the existing app structure. Neither is necessary here. The implementation uses
the existing React, YAML, Markdown and single-file build, with no new dependency
or copied project code/prose. Primary tool sources remain the syntax authority.

## Evidence boundary

Commands were compared with references, not executed against AD services or lab
targets. Browser tests prove application behavior, content checks prove reference
integrity, and neither proves target exploitability. See the in-app
`field-guide/coverage` page for retained study gaps and contextual source material.
