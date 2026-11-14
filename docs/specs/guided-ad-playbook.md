# Guided AD enumeration and HTTP WinPEAS transfer

The user needs an actionable OSCP reference: scan first, identify the domain with
SMB, select services actually found, and see the corresponding commands inline.
The existing AD playbook assumes too much and sends the user elsewhere for commands.

- Begin with Nmap commands, followed by SMB domain identification when SMB is available.
- Offer service checkboxes after scanning. SMB and WinRM must be independently
  selectable, and LDAP commands must appear only when LDAP is selected.
- Show copyable commands in each relevant step, using current variable values.
  Reuse fenced commands from note headings so notes and playbooks cannot drift.
- Preserve service selections across Back/reload and isolate selections by the
  current profile and target address. Restart clears selections for that context.
- Keep prerequisite and expected-result guidance short and concrete. Do not
  present a fixed exploitation chain as an exam guarantee.
- Use the user's HTTP WinPEAS method: serve `/usr/share/peass/winpeas/` on Kali,
  then pull `winPEASx64.exe` with `iwr` from target PowerShell. Use LHOST for the
  Kali address reachable from the target and LPORT for the HTTP server port.
  Include both sides in the Windows cheatsheet and playbook, without relying on
  Evil-WinRM's file-transfer commands.
- Source commands from the user's supplied material, existing notes and checked
  primary documentation. Preserve TODO: verify where details remain unknown.
- Update heading references, rules and authoring guidance; preserve the offline
  build and OSCP-only scope. Commit in focused steps and leave a reviewable PR.

The user confirmed tests through the rendered playbook, scan/domain steps,
service checkboxes, filled/copied commands, and Back/reload behavior. Implement
one red-before-green slice at a time, then run all checks and both review axes.
