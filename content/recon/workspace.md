---
title: Prepare a target workspace
order: 0
tags: [setup, kali, workspace, evidence, bash]
---

Run on **Kali**. Keep tool installation under `/home/kali/tools` and target output
in a separate working directory. Adapted from [Setup and Listeners](https://app.notion.com/413bbf9f0e748189a22efc95bb7700a4).

## Target directories

Choose a simple target label, such as `dc01`, without shell metacharacters.

```bash
mkdir -p '{{WORKDIR}}'/scans '{{WORKDIR}}'/files '{{WORKDIR}}'/exploits '{{WORKDIR}}'/evidence
cd '{{WORKDIR}}'
pwd
```

Use distinct scan basenames for each host. Keep original files and exploit copies
separate from modified ones so the route remains reproducible.

## Check the operator route

```bash
ip -br address
ip route get '{{RHOST}}'
ss -lntp
```

Check the selected interface, source address and existing listener bindings.
LHOST must be reachable from the target's network position. A VPN interface being
present does not establish a working route. [ip route](https://man7.org/linux/man-pages/man8/ip-route.8.html).

## Capture a terminal session

```bash
script -q -a '{{WORKDIR}}/evidence/session.log'
```

Run `exit` to close the recorded subshell. The log can contain credentials and
control sequences; keep it with local evidence and inspect before sharing.
Screenshots and exact proof requirements remain separate.
[util-linux script](https://man7.org/linux/man-pages/man1/script.1.html).
