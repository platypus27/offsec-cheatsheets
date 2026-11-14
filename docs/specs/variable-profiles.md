# Variable profiles

The user works on one box at a time and wants to switch its saved IP and other
values into every command. The app will be hosted for multiple people, with
personal state kept in each person's browser.

## Behavior

- The Variables panel has AD, Box 1, Box 2 and Box 3 tabs, plus an Add box action.
- Every profile has independent built-in and custom variable values.
- Browsing or editing a tab does not change which profile supplies commands.
  Make default selects that profile for all displayed and copied commands.
- The current default is visible in the panel and in the top bar.
- Profile values and the default selection persist in localStorage for the
  current origin and browser profile. They are not sent to a server or cookies.
  Separate browser sessions have independent values.
- A profile can optionally use an existing saved target. Its address and target
  variables retain precedence; overridden fields identify the saved target and
  link to its editor. Switching profiles restores that profile's target choice.
- Existing global values and active-target choice become Box 1's initial state.
  Existing targets, notes, ports, checklist progress and pins are preserved.
- A new profile starts empty so another box's credentials and address do not leak
  into it. There are no shared default values in this change.
- Keep the offline single-file build and OSCP-only scope.

## Confirmed verification interfaces

The user confirmed verification through the rendered Variables tabs, filled and
copied commands, and reload persistence in separate browser sessions. Extend
those browser journeys using red-before-green slices. Keep existing unit and
content checks, and review the final diff against this spec and repository standards.
