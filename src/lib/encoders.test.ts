import { describe, expect, it } from 'vitest'
import { ENCODERS, runEncoder } from './encoders'

const run = (id: string, input: string) => runEncoder(id, input)

describe('encoders', () => {
  it('round-trips base64 with full unicode', () => {
    expect(run('base64-encode', 'héllo ✓')).toEqual({ ok: true, value: 'aMOpbGxvIOKckw==' })
    expect(run('base64-decode', 'aMOpbGxvIOKckw==')).toEqual({ ok: true, value: 'héllo ✓' })
  })

  it('decodes url-safe and unpadded base64, and rejects garbage', () => {
    expect(run('base64-decode', 'aGk_Pz8')).toEqual({ ok: true, value: 'hi???' })
    expect(run('base64-decode', '@@@')).toMatchObject({ ok: false })
  })

  it('encodes UTF-16LE base64 for PowerShell -EncodedCommand', () => {
    expect(run('powershell-encode', 'whoami')).toEqual({ ok: true, value: 'dwBoAG8AYQBtAGkA' })
    expect(run('powershell-decode', 'dwBoAG8AYQBtAGkA')).toEqual({ ok: true, value: 'whoami' })
  })

  it('url-encodes components and decodes plus signs as spaces', () => {
    expect(run('url-encode', "a b&c=d/'")).toEqual({ ok: true, value: 'a%20b%26c%3Dd%2F%27' })
    expect(run('url-encode-all', 'ab')).toEqual({ ok: true, value: '%61%62' })
    expect(run('url-decode', 'a+b%20c')).toEqual({ ok: true, value: 'a b c' })
    expect(run('url-decode', '%E0%A4%A')).toMatchObject({ ok: false })
  })

  it('converts hex both ways, tolerating separators', () => {
    expect(run('hex-encode', 'Hi✓')).toEqual({ ok: true, value: '4869e29c93' })
    expect(run('hex-decode', '48 69 0x21 \\x21')).toEqual({ ok: true, value: 'Hi!!' })
    expect(run('hex-decode', 'abc')).toMatchObject({ ok: false })
  })

  it('escapes and unescapes HTML entities', () => {
    expect(run('html-encode', `<a href="x">'&'</a>`)).toEqual({
      ok: true,
      value: '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    })
    expect(run('html-decode', '&lt;b&gt; &amp;amp; &#65;&#x42; &unknown;')).toEqual({
      ok: true,
      value: '<b> &amp; AB &unknown;',
    })
  })

  it('applies rot13 symmetrically', () => {
    expect(run('rot13', 'Hello, World')).toEqual({ ok: true, value: 'Uryyb, Jbeyq' })
  })

  it('lists every encoder with a unique id and rejects unknown ids', () => {
    const ids = ENCODERS.map((encoder) => encoder.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(run('nope', 'x')).toMatchObject({ ok: false })
  })
})
