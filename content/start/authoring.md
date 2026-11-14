---
title: How to add notes
order: 1
tags: [guide]
---

Every page is a Markdown file at `content/<section>/<page>.md`. Sections and
pages appear in the sidebar and in search automatically.

## Page frontmatter

```yaml
---
title: Port scanning   # shown in the sidebar and search
order: 2               # lower comes first; ties sort by title
tags: [nmap, tcp]      # boosts search matches
---
```

A section's name and position come from `content/<section>/_meta.yaml`:

```yaml
title: Active Directory
order: 8
```

## Headings are search targets

Each `##` and `###` heading becomes its own search result, and opening a result
jumps straight to it. Keep one technique per heading so results stay precise.

## Variables in commands

Write `{{NAME}}` placeholders in code blocks. Set the values once in the
**Variables** panel (press `v`) and every block shows and copies the filled-in
command. Unset placeholders stay highlighted so nothing slips through.

Use the **AD** or **Box 1-3** tabs to save separate values. **Add box** creates
another profile. Choose **Make default** when switching which box you are working
on; that profile supplies every command. Browsing another tab does not switch
the default. Profiles and the default choice are saved in this browser.

With a saved target selected for the profile (see **Tools > Targets**), `{{RHOST}}`
comes from its address and its own variables override the profile values.

```bash
nc -lvnp {{LPORT}}
curl http://{{RHOST}}:{{RPORT}}/
```

Supported code languages include `bash`, `powershell`, `cmd`, `python`, `sql`,
`http`, `php`, `c`, `csharp`, `json` and `yaml`.

## Checklists

Task lists become checkboxes that remember their state in this browser. The
page header shows progress and a reset button.

- [ ] Write the first real page
- [ ] Delete this example list

## Links

Link to another page with `[text](section/page)`, to a heading with
`[text](section/page#heading-id)`, or within a page with `[text](#heading-id)`.
See the [checklist](methodology/checklist). External links open in a new tab.

## Suggestion rules

`content/_rules.yaml` maps open ports to your notes. The output parser and each
target page list the matching notes.

```yaml
- id: smb
  title: SMB
  match:
    ports: [139, 445]               # any of these port numbers
    services: [microsoft-ds]        # or a service name containing this
    versions: ['Samba 3\.']         # or a version matching this regex
  suggest: [services/common-services#smb]
  note: Optional reminder shown with the suggestion.
```

## Playbooks

Each file in `content/_playbooks/` is a decision tree. Every node has a
`prompt`, an optional `body` and note `links`, and `options` that lead to
other nodes. Use `commands` to show every fenced code block from a note heading
inline, with the same variable filling and Copy buttons as the note. Keep commands
in the note so corrections reach both views.

```yaml
title: No foothold yet
start: scanned
nodes:
  scanned:
    prompt: Have you scanned every port?
    options:
      - { label: 'Yes', next: web }
  web:
    prompt: Enumerate the web service.
    links: [web/web-enumeration#content-discovery]
```

## Playbook service checkboxes

A node can offer independent service checkboxes. Each service needs a unique
`id`, `title` and at least one command-bearing heading reference. `body` is an
optional short reminder. Only selected services show commands.

```yaml
services:
  - id: smb
    title: SMB
    body: Use a known domain account.
    commands: [active-directory/smb-enumeration#smb-share-permissions]
  - id: winrm
    title: WinRM
    commands: [services/remote-access#winrm-credential-check]
```

Service choices survive Back and reload in this browser. Choices are separate
for each playbook, default variable profile and effective RHOST. Restart clears
them for the current context. A node with neither services nor options ends the
branch. A command reference must point to a heading with a fenced code block;
`npm test` checks this along with normal links.

## Checking your notes

`npm test` fails if a link, rule or playbook points at a page or heading that
does not exist, so a rename never leaves dead ends behind. The section name
`tools` and folders starting with `_` are reserved.
