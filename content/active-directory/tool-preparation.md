---
title: Prepare Windows AD tools
order: 0
tags: [setup, rubeus, msbuild, sharphound, powerview, windows]
---

Use **Kali** for source staging and a **Windows operator build VM** for the
Windows build. Do not assume the domain foothold has a compiler or development
tools. Setup in the sidebar stages source and provides the final binary destination.

## Review the source revision

The documented Rubeus baseline is upstream commit
`74215f68ea70bd6a66c008da91bf5fe21d20b154`, inspected on 2026-11-18. Keep the
revision, build environment and resulting binary hash with your lab tools.
Upstream distributes source and documents local compilation, not official
precompiled executables.

On Kali, inspect the checkout prepared by Setup:

```bash
git -C /home/kali/tools/Rubeus rev-parse HEAD
sed -n '/TargetFrameworkVersion/p' /home/kali/tools/Rubeus/Rubeus/Rubeus.csproj
```

This revision's project declares .NET Framework **v4.0**, although the README's
compile paragraph mentions 3.5. Use the actual project requirements, install the
matching reference/targeting assemblies in the Windows build environment, and
check the target runtime. Do not silently retarget the project to get a build.
[Pinned project file](https://github.com/GhostPack/Rubeus/blob/74215f68ea70bd6a66c008da91bf5fe21d20b154/Rubeus/Rubeus.csproj),
[upstream compile instructions](https://github.com/GhostPack/Rubeus#compile-instructions).

## Windows Release build

On the **Windows operator VM**, use Visual Studio 2019 or a compatible full
MSBuild installation with the project's .NET Framework targeting assemblies.
Open its Developer PowerShell so `msbuild.exe` is on PATH. A modern .NET SDK
alone is not a replacement for those Framework reference assemblies.

```powershell
git clone https://github.com/GhostPack/Rubeus.git C:\Tools\Rubeus
git -C C:\Tools\Rubeus checkout --detach 74215f68ea70bd6a66c008da91bf5fe21d20b154
Set-Location C:\Tools\Rubeus
msbuild.exe Rubeus.sln /p:Configuration=Release '/p:Platform=Any CPU'
```

If the directory already exists, inspect it and fetch the recorded revision
instead of cloning over it. Read the build output; do not treat source checkout
as a built tool. The solution defines `Release|Any CPU` and the project writes
to `Rubeus\bin\Release`.
[MSBuild invocation and properties](https://learn.microsoft.com/en-us/visualstudio/msbuild/msbuild-command-line-reference).

## Verify and return the binary

On the **Windows operator VM**, confirm the file and inspect its usage output:

```powershell
Test-Path C:\Tools\Rubeus\Rubeus\bin\Release\Rubeus.exe
Get-FileHash C:\Tools\Rubeus\Rubeus\bin\Release\Rubeus.exe -Algorithm SHA256
& C:\Tools\Rubeus\Rubeus\bin\Release\Rubeus.exe
```

Transfer that reviewed output to Kali. With a reachable Kali SSH service and the
Windows OpenSSH client, this copies it to an intermediate local build filename:

```powershell
scp C:\Tools\Rubeus\Rubeus\bin\Release\Rubeus.exe 'kali@{{LHOST}}:/home/kali/tools/Rubeus-built.exe'
```

On **Kali**, stage and verify the same bytes:

```bash
install -m 0644 /home/kali/tools/Rubeus-built.exe /home/kali/tools/binaries/Rubeus.exe
sha256sum /home/kali/tools/binaries/Rubeus.exe
```

Compare the Windows and Kali SHA-256 values. Then
[transfer and verify on the Windows foothold](shells/file-transfers) before using
[ticket inspection](active-directory/tickets#windows-ticket-inspection-and-reuse)
or [delegation monitoring](active-directory/delegation#unconstrained-delegation).
This procedure was source-inspected; no Windows build or AD execution is claimed
by the application update.

## Collector and PowerView staging

Setup places the packaged SharpHound files under `/home/kali/tools/sharphound`
and the PowerView script under `/home/kali/tools/binaries/PowerView.ps1`. Match the
collector to your installed CE instance, retain any required adjacent files and
check `--help` before collection. PowerView is archived; use the
[native alternatives](active-directory/windows-enumeration) when incompatible.
