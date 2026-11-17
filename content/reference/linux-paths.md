---
title: Linux path reference
order: 0
tags: [linux, paths, configuration, credentials, logs, xdg]
---

Adapted from the expanded path tables in the supplied
[Field Manual](https://app.notion.com/413bbf9f0e748189b961d23104ab7509).
`~` is the current home; XDG and application configuration can override defaults.
A known path does not imply read access or that a file exists.

## System and configuration

| Path | Purpose and caveat |
| --- | --- |
| `/etc/os-release` | Distribution identity; does not prove patch status |
| `/etc/passwd`, `/etc/group` | Account/group metadata; not plaintext password stores |
| `/etc/shadow` | Protected password verifiers; separate permission boundary |
| `/etc/sudoers`, `/etc/sudoers.d/` | Sudo configuration; use `sudo -l` for the current rule view |
| `/etc/hosts`, `/etc/resolv.conf` | Host overrides and resolver configuration; may be generated |
| `/etc/ssh/sshd_config`, `/etc/ssh/sshd_config.d/` | SSH daemon configuration and optional includes |
| `/etc/fstab`, `/proc/mounts` | Configured versus active mounts |
| `/etc/exports` | NFS exports; server options and version still need confirmation |
| `/etc/systemd/system/` | Administrator unit definitions/overrides |
| `/usr/lib/systemd/system/`, `/lib/systemd/system/` | Vendor units; distro layout varies |

## Users and credentials

| Path | Purpose and caveat |
| --- | --- |
| `~/.ssh/config`, `~/.ssh/known_hosts` | Client host/identity leads; not login proof |
| `~/.ssh/id_*` | Possible keys; distinguish private/public and encrypted formats |
| `~/.ssh/authorized_keys` | Accepted public keys for that account |
| `~/.bash_history`, `~/.zsh_history` | Shell history; may be disabled or incomplete |
| `~/.mysql_history`, `~/.psql_history` | SQL client history; application/version dependent |
| `~/.gitconfig`, `{PROJECT}/.git/config` | Git configuration and remote URLs |
| `~/.config/`, `~/.local/share/`, `~/.cache/` | Common XDG defaults; inspect environment overrides |
| `~/.aws/`, `~/.azure/`, `~/.kube/` | Optional provider/client configuration; credential validity is separate |
| `~/.docker/config.json` | Docker client settings; may reference a credential helper |
| `~/.local/share/keyrings/` | Desktop keyring data, generally protected/encrypted |

## Applications and schedules

| Path | Purpose and caveat |
| --- | --- |
| `/var/www/`, `/srv/`, `/opt/` | Common application data; actual service paths can differ |
| `/etc/apache2/`, `/etc/nginx/` | Common Debian-family web configuration |
| `/etc/mysql/`, `/etc/postgresql/` | Common distro database configuration |
| `{APP}/.env`, `{APP}/config*` | App-selected configuration; validate the active consumer |
| `/var/backups/`, `{APP}/*.bak` | Possible backups; not guaranteed or necessarily current |
| `/etc/crontab`, `/etc/cron.d/` | System scheduling definitions |
| `/var/spool/cron/`, `/var/spool/cron/crontabs/` | User crontabs; distro/permission dependent |
| `/tmp/`, `/var/tmp/`, `/dev/shm/` | Temporary/shared-memory files; mount options vary |

## Logs and runtime

| Path | Purpose and caveat |
| --- | --- |
| `/var/log/auth.log`, `/var/log/secure` | Distro-dependent authentication logs |
| `/var/log/syslog`, `/var/log/messages` | Traditional general logs; journal may replace them |
| `/var/log/journal/`, `/run/log/journal/` | Persistent/runtime systemd journal stores |
| `/proc/{PID}/cmdline`, `/proc/{PID}/environ` | Process metadata subject to access controls |
| `/run/`, `/var/run/` | Runtime state/sockets; `/var/run` is commonly a symlink |
| `/proc/net/`, `/sys/` | Kernel/runtime views, not ordinary editable config files |

Use [targeted credential hunting](linux/credential-hunting) and
[path permission checks](linux/permissions-and-jobs#trace-path-permissions).
