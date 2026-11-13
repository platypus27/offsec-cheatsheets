export type EncoderResult = { ok: true; value: string } | { ok: false; error: string }

export interface Encoder {
  id: string
  label: string
  group: 'Base64' | 'URL' | 'Hex' | 'HTML' | 'Other'
  run: (input: string) => string
}

const utf8 = new TextEncoder()
const utf8Strict = new TextDecoder('utf-8', { fatal: true })

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToBytes(input: string): Uint8Array {
  const normalized = input.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) throw new Error('Not valid Base64')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

function utf16leBytes(input: string): Uint8Array {
  const bytes = new Uint8Array(input.length * 2)
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index)
    bytes[index * 2] = code & 0xff
    bytes[index * 2 + 1] = code >> 8
  }
  return bytes
}

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

export const ENCODERS: Encoder[] = [
  { id: 'base64-encode', label: 'Base64 encode', group: 'Base64', run: (input) => bytesToBase64(utf8.encode(input)) },
  { id: 'base64-decode', label: 'Base64 decode', group: 'Base64', run: (input) => utf8Strict.decode(base64ToBytes(input)) },
  {
    id: 'powershell-encode',
    label: 'PowerShell -EncodedCommand',
    group: 'Base64',
    run: (input) => bytesToBase64(utf16leBytes(input)),
  },
  {
    id: 'powershell-decode',
    label: 'PowerShell -EncodedCommand decode',
    group: 'Base64',
    run: (input) => {
      const bytes = base64ToBytes(input)
      if (bytes.length % 2 !== 0) throw new Error('UTF-16LE data must have an even byte length')
      return new TextDecoder('utf-16le').decode(bytes)
    },
  },
  {
    id: 'url-encode',
    label: 'URL encode',
    group: 'URL',
    run: (input) => encodeURIComponent(input).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`),
  },
  {
    id: 'url-encode-all',
    label: 'URL encode every byte',
    group: 'URL',
    run: (input) => Array.from(utf8.encode(input), (byte) => `%${byte.toString(16).toUpperCase().padStart(2, '0')}`).join(''),
  },
  {
    id: 'url-decode',
    label: 'URL decode',
    group: 'URL',
    run: (input) => {
      try {
        return decodeURIComponent(input.replace(/\+/g, ' '))
      } catch {
        throw new Error('Malformed percent-encoding')
      }
    },
  },
  {
    id: 'hex-encode',
    label: 'Hex encode',
    group: 'Hex',
    run: (input) => Array.from(utf8.encode(input), (byte) => byte.toString(16).padStart(2, '0')).join(''),
  },
  {
    id: 'hex-decode',
    label: 'Hex decode',
    group: 'Hex',
    run: (input) => {
      const digits = input.replace(/0x|\\x/gi, '').replace(/[\s,:]/g, '')
      if (!/^(?:[0-9a-f]{2})*$/i.test(digits)) throw new Error('Hex needs an even number of 0-9a-f digits')
      return utf8Strict.decode(Uint8Array.from(digits.match(/../g) ?? [], (pair) => parseInt(pair, 16)))
    },
  },
  { id: 'html-encode', label: 'HTML entity encode', group: 'HTML', run: (input) => input.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char) },
  {
    id: 'html-decode',
    label: 'HTML entity decode',
    group: 'HTML',
    // One pass only, so "&amp;amp;" decodes to "&amp;" exactly as a browser would.
    run: (input) =>
      input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
        if (body[0] === '#') {
          const code = body[1]?.toLowerCase() === 'x' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10)
          return code <= 0x10ffff ? String.fromCodePoint(code) : match
        }
        return NAMED_ENTITIES[body.toLowerCase()] ?? match
      }),
  },
  {
    id: 'rot13',
    label: 'ROT13',
    group: 'Other',
    run: (input) =>
      input.replace(/[a-z]/gi, (char) => {
        const base = char <= 'Z' ? 65 : 97
        return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base)
      }),
  },
]

export function runEncoder(id: string, input: string): EncoderResult {
  const encoder = ENCODERS.find((item) => item.id === id)
  if (!encoder) return { ok: false, error: `Unknown encoder "${id}"` }
  try {
    return { ok: true, value: encoder.run(input) }
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : 'Could not convert input'
    return { ok: false, error: message.includes('decode') || message.includes('atob') ? 'Input is not valid for this decoder' : message }
  }
}
