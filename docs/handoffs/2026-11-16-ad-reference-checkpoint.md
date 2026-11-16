# AD reference checkpoint

Paused at the user's explicit request on 2026-11-16 so they can restart their computer.
Resume only when asked. This is unfinished work, not an accepted release.

## Objective and agreed boundaries

The user approved improving the cheatsheet's UX and making the AD content as
complete as possible within the established OSCP/PEN-200 scope. See
[the accepted spec](../specs/ad-reference-completeness.md).

- Repository: `/mnt/fast/git-repos/offsec-cheatsheets`.
- Branch: `feat/ad-reference-completeness`.
- Clean starting commit and agreed review baseline: `52d7d3e`.
- User explicitly approved rendered browser workflows and the parsed real-content
  interface as test boundaries.
- Use `/tdd` for implementation and `/review` afterward. The review must run
  separate Standards and Spec agents against the baseline. The user approved the
  baseline; do not ask again. Use the local spec above. Review has not run yet.
- No em dash; no co-author attribution, generated-file edits or committed secrets.
- Reproduce bugs through the rendered application before fixing them. Keep profile
  isolation, offline operation, heading URLs and persisted task identities intact.
- No external messages, deployment or live AD lab testing have been authorized.

## Implemented and individually verified

1. Quoted AD outcome labels so commas no longer truncate them. The playbook parser
   rejects unknown option keys with an actionable message. Existing rendered app
   reproduced labels such as `Credential` and `DCSync` before the fix; the parsed
   content regression failed first and then passed.
2. Companion transitions scroll and focus the current heading. Browser regression
   failed before implementation and passed afterward.
3. Advanced command values are editable inside each code block. They use the
   current profile's existing variable storage, fill display/copy consistently,
   survive reload and remain isolated across profiles. Basic profile fields remain
   unchanged. Unfilled values are visibly listed; copying remains available.
4. Companion commands retain their source Markdown prose and links. Chunks now
   preserve Markdown excerpts and their source-line offsets so existing task keys
   can be reused by the renderer. The prerequisite/rendering browser regression
   failed first and passed afterward.
5. Long notes have a mobile section index using real heading routes. Browser
   regression passed after reproducing its absence.
6. Selected service command sections collapse without losing their check state.
   Sticky shortcuts jump to findings and outcomes. Browser regression passed.
7. Home shows the current target and resume links, including the current prompt,
   before setup. Browser regression passed.

All six newly added browser journeys passed individually in Chromium. They live
in `e2e/playbook-commands.spec.ts`; the new context fixtures are intentional.
The parser's ten tests passed. The label/content tests passed before adding the
next deliberately failing coverage test. Typecheck passed before pausing.

## Intentional RED state and remaining implementation

`src/ad-companion.content.test.ts` has a new test named
`makes the missing course workflows actionable from the companion`. It is
intentionally RED because the content expansion has not been implemented.
Do not misreport the current full suite as passing, remove the test, or turn it
into a skip merely to get green.

The test expects these referenced headings to contain commands and be available
from the AD companion:

- `active-directory/windows-enumeration#native-domain-enumeration`
- `active-directory/windows-enumeration#directory-search-with-net`
- `active-directory/windows-enumeration#powerview-enumeration`
- `active-directory/windows-enumeration#sharphound-ce-collection`
- `active-directory/tickets#overpass-the-hash`
- `active-directory/tickets#pass-the-ticket-from-kali`
- `active-directory/tickets#silver-tickets`
- `active-directory/tickets#golden-tickets`
- `active-directory/credential-access#dcom-execution`
- `active-directory/delegation#constrained-delegation`
- `active-directory/delegation#unconstrained-delegation`
- `active-directory/relay#relay-to-smb`
- Intake option `I have supplied domain credentials` leading to `services`.

Also outstanding:

- AD task/coverage index; useful native/.NET/PowerView queries, graph collection
  and interpretation; ticket acquisition, conversion, reuse and cleanup.
- Complete group/ACL, delegation, relay and certificate paths with prerequisites,
  expected success, failure recovery and cleanup. Split alternative state-changing
  operations into separate copy blocks.
- Fix the verified `-target '{{DOMAIN_DN}}'` mistake in
  `content/active-directory/attack-paths.md:28`: Impacket requires `-target-dn` for
  a distinguished name.
- Complete ESC7 request approval, private-key retention, retrieval and auth.
- Resolve source-verifiable AES AS-REP, DCC2-format and time-sync TODOs.
- Extend setup for required target tools and BloodHound CE. Keep fixed tool paths,
  compatible collectors and actual package/release verification.
- Update README, CONTRIBUTING and architecture notes for contextual command inputs,
  retained command prose and content coverage. They still describe the old UI.
- Inspect real content on desktop/mobile after implementation, including long
  service steps and the offline file build. Check excerpt task persistence and
  duplicate-heading behavior; the whole relevant suite has not yet been run.
- Run formatting, lint, unit/content tests, typecheck, build and all browser
  projects. Existing documented Firefox Axe skips remain evidence gaps.
- Run both review axes, fix findings, commit focused final changes and prepare a PR
  following repository policy. No PR or deployment exists at this checkpoint.

## Sources already inspected

Commands have been compared with sources, not executed against AD services.
Temporary downloads under `/tmp/offsec-ad-sources` may disappear after restart.
Re-fetch as needed; do not depend on them as durable evidence.

- OffSec current course mapping includes native Windows/.NET/PowerView, SharpHound,
  silver tickets, overpass-the-hash, pass-the-ticket, DCOM and golden tickets:
  <https://help.offsec.com/hc/en-us/articles/53329794506004-PEN-200-Offline-Video-Mapping>.
- Assumed-compromise AD entry:
  <https://help.offsec.com/hc/en-us/articles/4547917816468-OffSec-OSCP-Exam-with-AD-Preparation>.
- Impacket `examples/` sources checked: `dacledit.py`, `getTGT.py`, `getST.py`,
  `ticketConverter.py`, `ticketer.py`, `findDelegation.py`, `dcomexec.py`,
  `ntlmrelayx.py`, `GetLAPSPassword.py`:
  <https://github.com/fortra/impacket/tree/master/examples>.
- Certipy ESC workflows and command reference:
  <https://github.com/ly4k/Certipy/wiki/06-%E2%80%90-Privilege-Escalation> and
  <https://github.com/ly4k/Certipy/wiki/08-%E2%80%90-Command-Reference>.
- Rubeus flags and ticket semantics: <https://github.com/GhostPack/Rubeus>.
- Native enumeration: Microsoft `DirectorySearcher.FindAll`, `klist` and Kerberos
  troubleshooting docs. PowerView source:
  <https://github.com/PowerShellMafia/PowerSploit/blob/master/Recon/PowerView.ps1>.
  PowerSploit is archived; retain native/maintained alternatives.
- SharpHound flags:
  <https://bloodhound.specterops.io/collect-data/ce-collection/sharphound-flags>.
  Kali packages: <https://www.kali.org/tools/sharphound/>,
  <https://www.kali.org/tools/powersploit/>, <https://www.kali.org/tools/bloodhound/>.
  Kali lists `/usr/share/sharphound`, recommends matching collectors from CE, and
  exposes `bloodhound-setup` / `bloodhound-start`. Verify the installed package's
  PowerView path rather than assuming which Kali symlink is present.
- Hashcat upstream example hashes confirm modes 32100/32200 for AES AS-REP and
  mode 2100 with `$DCC2$10240#username#hash`:
  <https://github.com/hashcat/hashcat/blob/master/docs/hashcat-example-hashes.md>.
- Time query/step flags: <https://docs.ntpsec.org/latest/ntpdig.html> (`-S` steps
  local time). No clock changes were executed.
- gMSA: <https://www.netexec.wiki/ldap-protocol/dump-gmsa>; `--gmsa` uses LDAPS.
- bloodyAD add/remove group and ACL source:
  <https://github.com/CravateRouge/bloodyAD/tree/main/bloodyAD/cli_modules>.

## Open-source approach comparison

Before new content work, inspected maintained GitHub projects and licenses:
Impacket (Fortra-modified Apache 1.1), Certipy (MIT), SharpHound (GPL-3.0),
PowerView.py (MIT), The Hacker Recipes and GOAD (GPL-3.0).
GitHub metadata showed these were not archived and had 2026 updates. PowerSploit
is archived. Follow proven task/prerequisite/result structure and cite tool authors;
write original prose, do not import incompatible licensed text or source code.
The app keeps its existing libraries and offline architecture.

## Restart prompt

Continue `/mnt/fast/git-repos/offsec-cheatsheets` on
`feat/ad-reference-completeness`. Read this checkpoint and the linked spec first.
Preserve the UX changes. Resume the intentionally RED AD content-coverage slice,
then complete documentation, full validation, real-content browser/offline checks
and independent Standards/Spec review against `52d7d3e`. Do not repeat the already
approved test-boundary or baseline questions. No live AD validation has occurred.
