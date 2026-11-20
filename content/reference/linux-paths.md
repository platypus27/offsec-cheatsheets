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

## Boot, firmware and packages

| Path | Purpose and caveat |
| --- | --- |
| `/boot/`, `/boot/efi/`, `/efi/` | Kernels, initramfs images and possible EFI system partition mount points; check the active mounts |
| `/etc/default/grub`, `/boot/grub/` | GRUB configuration inputs and generated files on GRUB systems |
| `/usr/bin/`, `/usr/sbin/`, `/usr/lib/` | Distribution executables and libraries; `/bin`, `/sbin` and `/lib` may link into `/usr` |
| `/usr/local/bin/`, `/usr/local/share/` | Locally installed tools and shared data |
| `/etc/apt/sources.list.d/`, `/var/lib/dpkg/status` | APT sources and installed package metadata on Debian family systems |
| `/etc/yum.repos.d/`, `/etc/pacman.d/` | Repository and package manager configuration on applicable distributions |
| `/var/cache/apt/archives/`, `/var/cache/pacman/pkg/` | Download caches; cached artifacts do not establish the installed version |
| `/usr/src/`, `/usr/include/` | Packaged source or development headers when installed |

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

## Desktop, browser and development data

| Path | Purpose and caveat |
| --- | --- |
| `~/.config/user-dirs.dirs` | User folder mappings such as Documents and Downloads |
| `~/.local/state/`, `~/.local/bin/` | Default XDG user state and a common per-user executable directory |
| `~/.mozilla/firefox/`, `~/.config/chromium/` | Common browser profile roots; packaged and sandboxed installs can relocate them |
| `~/.config/Code/`, `~/.vscode/extensions/` | Common VS Code settings and extension roots |
| `~/.var/app/`, `~/snap/` | Per-app user data for Flatpak and Snap installations |
| `~/.local/share/applications/`, `/usr/share/applications/` | User and system desktop entries |
| `~/.config/autostart/`, `/etc/xdg/autostart/` | Desktop session startup entries; separate from system services |
| `~/.local/share/fonts/`, `/usr/share/fonts/`, `/usr/share/icons/` | User font and system font/icon assets |
| `~/.thunderbird/`, `~/Maildir/`, `/var/mail/` | Example local mail stores; location and format depend on the client/server |
| `~/.local/share/Steam/`, `~/Documents/` | Optional application libraries and working data; document and sync folders can be relocated |

## Applications and schedules

| Path | Purpose and caveat |
| --- | --- |
| `/var/www/`, `/srv/`, `/opt/` | Common application data; actual service paths can differ |
| `/etc/apache2/`, `/etc/nginx/` | Common Debian-family web configuration |
| `/etc/mysql/`, `/etc/postgresql/` | Common distro database configuration |
| `{APP}/.env`, `{APP}/config*` | App-selected configuration; validate the active consumer |
| `{APP}/*.bak` | Possible application backups; not guaranteed or necessarily current |
| `/etc/crontab`, `/etc/cron.d/` | System scheduling definitions |
| `/var/spool/cron/`, `/var/spool/cron/crontabs/` | User crontabs; distro/permission dependent |
| `/tmp/`, `/var/tmp/`, `/dev/shm/` | Temporary/shared-memory files; mount options vary |

## Service state and virtual machines

| Path | Purpose and caveat |
| --- | --- |
| `/var/lib/`, `/var/cache/`, `/var/spool/` | Persistent service state, rebuildable cache and queued work respectively |
| `/var/log/nginx/`, `/var/log/apache2/` | Common web logs; active vhost configuration determines the real destination |
| `/var/lib/postgresql/`, `/var/lib/mysql/` | Common database state roots; check the service configuration and avoid editing data files directly |
| `/etc/docker/daemon.json`, `/var/lib/docker/` | Common Docker daemon settings and state; rootless and alternate storage configurations differ |
| `/etc/containers/`, `~/.config/containers/` | System and user container settings where the tooling uses containers.conf |
| `/etc/libvirt/`, `/var/lib/libvirt/images/` | Common libvirt configuration and image storage; storage pools can use other locations |
| `/etc/wsl.conf`, `/mnt/c/` | Per-distro WSL settings and a common Windows drive mount inside WSL |

## Devices, mounts and backups

| Path | Purpose and caveat |
| --- | --- |
| `/dev/`, `/dev/disk/by-uuid/` | Device nodes and persistent identifier links; mount paths are separate |
| `/media/`, `/run/media/{USER}/`, `/mnt/` | Common removable and manual mount roots |
| `/proc/self/mountinfo` | Active mounts as seen by the reading process; namespaces can differ |
| `/etc/crypttab` | Encrypted volume activation configuration when managed by the host |
| `/lost+found/` | Filesystem recovery directory on some filesystem types |
| `/var/backups/` | Optional local backup storage; confirm the actual backup policy and destinations |

## Logs and runtime

| Path | Purpose and caveat |
| --- | --- |
| `/var/log/auth.log`, `/var/log/secure` | Distro-dependent authentication logs |
| `/var/log/syslog`, `/var/log/messages` | Traditional general logs; journal may replace them |
| `/var/log/journal/`, `/run/log/journal/` | Persistent/runtime systemd journal stores |
| `/proc/{PID}/cmdline`, `/proc/{PID}/environ` | Process metadata subject to access controls |
| `/run/`, `/var/run/` | Runtime state/sockets; `/var/run` is commonly a symlink |
| `/proc/net/`, `/sys/` | Kernel/runtime views, not ordinary editable config files |
| `/var/lib/systemd/coredump/` | Saved crash dumps where configured; may contain sensitive process memory |
| `/var/log/audit/` | Common audit log directory when auditd is configured |
| `/run/user/{UID}/` | Usual systemd-logind user runtime directory; check `XDG_RUNTIME_DIR` |

Use [targeted credential hunting](linux/credential-hunting) and
[path permission checks](linux/permissions-and-jobs#trace-path-permissions).

See the [systemd filesystem hierarchy](https://www.freedesktop.org/software/systemd/man/latest/file-hierarchy.html),
[XDG base directories](https://specifications.freedesktop.org/basedir/latest/) and
[WSL filesystem guidance](https://learn.microsoft.com/en-us/windows/wsl/filesystems).
