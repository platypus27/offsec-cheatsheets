---
title: Native Windows and graph enumeration
order: 2
tags: [ad, powershell, net, powerview, sharphound, bloodhound, ldap]
---

Run these commands **on a domain-joined Windows foothold** as the identity you
actually control. Use [Kali enumeration](active-directory/ad-enumeration) when no
Windows session exists. Record the collection time, account and network position.

## Native domain enumeration

Confirm local versus domain authority, group membership, logon controller and
network position before assuming any directory or remote-management rights.

```cmd
whoami /all
hostname
echo %USERDOMAIN%
echo %LOGONSERVER%
ipconfig /all
net user /domain
net group /domain
net group "Domain Admins" /domain
net accounts /domain
```

Group names can be localized. A successful domain query does not imply local
administrator access. Use `net user {{TARGET_USER}} /domain` and
`net group "{{GROUP}}" /domain` for the observed names. [Microsoft net commands](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/net-commands).

## Directory search with .NET

PowerShell's DirectoryServices classes can query AD without installing RSAT.
The default domain binding uses the current process identity and network access.

```powershell
$root = [ADSI]'LDAP://RootDSE'
$base = [ADSI]("LDAP://" + $root.defaultNamingContext)
$search = New-Object System.DirectoryServices.DirectorySearcher($base)
$search.Filter = '(&(objectCategory=person)(objectClass=user))'
$search.PageSize = 1000
$search.PropertiesToLoad.AddRange(@('samaccountname','description','memberof','serviceprincipalname'))
$search.FindAll() | ForEach-Object { $_.Properties }
```

To inspect computers or groups, change only the filter and relevant properties.
Save the naming context returned by RootDSE rather than inventing a base DN.
An empty or failed search may indicate bind, DNS, referral or scope problems.
[DirectorySearcher](https://learn.microsoft.com/en-us/dotnet/api/system.directoryservices.directorysearcher), [LDAP search syntax](https://learn.microsoft.com/en-us/windows/win32/adsi/search-filter-syntax).

## PowerView enumeration

Stage a reviewed `PowerView.ps1` in the current directory. PowerSploit is archived;
use the native queries above if the script is incompatible. Importing the script
does not grant directory permissions.

```powershell
Import-Module .\PowerView.ps1
Get-Domain
Get-DomainUser -Properties samaccountname,description,memberof
Get-DomainComputer -Properties dnshostname,operatingsystem
Get-DomainGroup -Identity 'Domain Admins'
Get-DomainGroupMember -Identity '{{GROUP}}' -Recurse
Get-DomainUser -SPN
Get-DomainObjectAcl -Identity '{{TARGET_USER}}' -ResolveGUIDs
```

Check the trustee SID, object type, inheritance and deny entries before turning
an ACE into an attack hypothesis. Nested membership and remote logon permissions
need independent confirmation. [PowerView source and function definitions](https://github.com/PowerShellMafia/PowerSploit/blob/master/Recon/PowerView.ps1).

## SharpHound CE collection

Download the collector supported by the installed BloodHound CE instance. Run on
the Windows foothold; ensure the DC and chosen collection targets are reachable.

```powershell
.\SharpHound.exe --help
.\SharpHound.exe --CollectionMethods DCOnly --Domain '{{DOMAIN}}' --DomainController '{{DC_FQDN}}' --OutputDirectory . --ZipFileName ad-directory.zip
```

`DCOnly` collects directory relationships without host session enumeration.
For a deliberately broader collection, use a separate command:

```powershell
.\SharpHound.exe --CollectionMethods All --Domain '{{DOMAIN}}' --DomainController '{{DC_FQDN}}' --OutputDirectory . --ZipFileName ad-all.zip
```

Import the archive into the matching CE version. Review collection failures and
unreachable machines before trusting absent paths; host methods can need local
rights. [CE flags](https://bloodhound.specterops.io/collect-data/ce-collection/sharphound-flags).

## Interpret a graph path

1. Mark the users and computers you actually control.
2. Inspect each proposed edge: source SID, target object, right, inheritance and
   collection time. Record any missing host or directory data.
3. Confirm that exact permission with a direct query and check the target's service
   prerequisites. A shortest path is a hypothesis, not end-to-end proof.
4. After changing identity or group membership, refresh the relevant session or
   ticket and recheck the affected edges.

Continue to [ACL operations](active-directory/attack-paths#acl-abuse-operations),
[delegation](active-directory/delegation) or [certificates](active-directory/attack-paths#ad-cs-enrollment-prerequisites).
[BloodHound data quality](https://bloodhound.specterops.io/collect-data/review-data-quality).
