---
title: Database enumeration
order: 3
tags: [database, mssql, mysql, postgresql, sql]
---

## MSSQL

Domain credentials with Windows authentication. Run from the installed Impacket examples directory:

```bash
python3 mssqlclient.py '{{DOMAIN}}/{{USER}}:{{PASS}}@{{RHOST}}' -port {{RPORT}} -windows-auth
```

In the connected SQL session:

```sql
SELECT @@VERSION;
SELECT SYSTEM_USER;
SELECT name FROM sys.databases;
```

TODO: verify the installed entry point; Kali packages may expose impacket-mssqlclient instead. [Pinned client source](https://github.com/fortra/impacket/blob/impacket_0_13_1/examples/mssqlclient.py), [version query](https://learn.microsoft.com/en-us/sql/t-sql/functions/version-transact-sql), [identity](https://learn.microsoft.com/en-us/sql/t-sql/functions/system-user-transact-sql), [database catalog](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-databases-transact-sql).

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
