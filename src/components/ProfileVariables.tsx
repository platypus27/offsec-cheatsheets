import { Input } from '@kryv/teal'
import type { VariableProfile } from '../lib/profiles'

const PROFILE_FIELDS = [
  { name: 'RHOST', label: 'IP address', hint: "This box's address" },
  { name: 'DOMAIN', label: 'Domain', hint: 'Active Directory domain, when known' },
  { name: 'USER', label: 'Username', hint: 'Current account, when known' },
  { name: 'PASS', label: 'Password', hint: 'Current password, when known' },
] as const

interface ProfileVariablesProps {
  profile: VariableProfile
  onChange: (name: string, value: string) => void
}

export function ProfileVariables({ profile, onChange }: ProfileVariablesProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PROFILE_FIELDS.map((field) => (
        <Input
          key={field.name}
          label={field.label}
          description={field.hint}
          value={profile.variables[field.name] ?? ''}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={field.name === 'RHOST' || field.name === 'DOMAIN' ? 'font-mono' : undefined}
          spellCheck={false}
          autoComplete="off"
        />
      ))}
    </div>
  )
}
