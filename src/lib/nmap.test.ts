import { describe, expect, it } from 'vitest'
import { parseScan } from './nmap'

const normal = `Starting Nmap 7.95 ( https://nmap.org ) at 2026-11-14 10:00 UTC
Nmap scan report for box.lab (10.10.10.5)
Host is up (0.031s latency).
Not shown: 995 closed tcp ports (reset)
PORT     STATE    SERVICE       VERSION
21/tcp   open     ftp           vsftpd 3.0.3
22/tcp   open     ssh           OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
80/tcp   open     http          Apache httpd 2.4.41 ((Ubuntu))
| http-title: Site
|_Requested resource was /login
139/tcp  filtered netbios-ssn
445/tcp  open     microsoft-ds?
Service Info: OS: Linux

Nmap scan report for 10.10.10.6
Host is up.
PORT    STATE SERVICE
161/udp open  snmp
`

const grepable = `# Nmap 7.95 scan initiated
Host: 10.10.10.7 (dc01.corp.local)	Status: Up
Host: 10.10.10.7 (dc01.corp.local)	Ports: 53/open/tcp//domain//Simple DNS Plus/, 88/open/tcp//kerberos-sec//Microsoft Windows Kerberos/, 445/closed/tcp//microsoft-ds///	Ignored State: filtered (997)
# Nmap done`

const xml = `<?xml version="1.0"?>
<nmaprun><host><status state="up"/><address addr="10.10.10.8" addrtype="ipv4"/>
<hostnames><hostname name="web.lab" type="PTR"/></hostnames>
<ports><port protocol="tcp" portid="8080"><state state="open"/><service name="http" product="Jetty" version="9.4" extrainfo="x"/></port>
<port protocol="tcp" portid="25"><state state="closed"/><service name="smtp"/></port></ports></host></nmaprun>`

describe('parseScan', () => {
  it('parses normal output with versions, hostnames and multiple hosts', () => {
    const result = parseScan(normal)
    expect(result.format).toBe('nmap-normal')
    expect(result.hosts).toHaveLength(2)
    const [box, second] = result.hosts
    expect(box).toMatchObject({ address: '10.10.10.5', hostname: 'box.lab' })
    expect(box!.ports).toEqual([
      { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'vsftpd 3.0.3' },
      { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)' },
      { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache httpd 2.4.41 ((Ubuntu))' },
      { port: 139, protocol: 'tcp', state: 'filtered', service: 'netbios-ssn', version: '' },
      { port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds?', version: '' },
    ])
    expect(second).toMatchObject({ address: '10.10.10.6', hostname: undefined })
    expect(second!.ports[0]).toMatchObject({ port: 161, protocol: 'udp', service: 'snmp' })
  })

  it('parses grepable output', () => {
    const result = parseScan(grepable)
    expect(result.format).toBe('nmap-grepable')
    expect(result.hosts).toEqual([
      {
        address: '10.10.10.7',
        hostname: 'dc01.corp.local',
        ports: [
          { port: 53, protocol: 'tcp', state: 'open', service: 'domain', version: 'Simple DNS Plus' },
          { port: 88, protocol: 'tcp', state: 'open', service: 'kerberos-sec', version: 'Microsoft Windows Kerberos' },
          { port: 445, protocol: 'tcp', state: 'closed', service: 'microsoft-ds', version: '' },
        ],
      },
    ])
  })

  it('parses XML output', () => {
    const result = parseScan(xml)
    expect(result.format).toBe('nmap-xml')
    expect(result.hosts[0]).toEqual({
      address: '10.10.10.8',
      hostname: 'web.lab',
      ports: [
        { port: 8080, protocol: 'tcp', state: 'open', service: 'http', version: 'Jetty 9.4 (x)' },
        { port: 25, protocol: 'tcp', state: 'closed', service: 'smtp', version: '' },
      ],
    })
  })

  it('skips XML ports without a port number', () => {
    const result = parseScan('<nmaprun><host><address addr="1.2.3.4" addrtype="ipv4"/><ports><port protocol="tcp"><state state="open"/></port></ports></host></nmaprun>')
    expect(result.hosts[0]!.ports).toEqual([])
  })

  it('accepts a bare port table without a host header', () => {
    const result = parseScan('PORT   STATE SERVICE\n3306/tcp open  mysql\n')
    expect(result.hosts).toEqual([
      { address: '', hostname: undefined, ports: [{ port: 3306, protocol: 'tcp', state: 'open', service: 'mysql', version: '' }] },
    ])
  })

  it('reports unrecognised input instead of guessing', () => {
    expect(parseScan('hello world')).toEqual({ format: 'unknown', hosts: [] })
    expect(parseScan('<nmaprun><broken')).toMatchObject({ format: 'unknown' })
  })
})
