import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, IconButton, Input } from '@kryv/teal'
import type { VariableProfile } from '../lib/profiles'
import { effectiveVariables, type Target } from '../lib/targets'
import { DEFAULT_VARIABLES, VARIABLE_NAME } from '../lib/variables'

const BUILT_INS = new Set(DEFAULT_VARIABLES.map((variable) => variable.name))

interface ProfileVariablesProps {
  profile: VariableProfile
  target?: Target
  onChange: (name: string, value: string) => void
  onRemove: (name: string) => void
}

/** The editor shows the same effective values as commands, including saved-target overrides. */
export function ProfileVariables({ profile, target, onChange, onRemove }: ProfileVariablesProps) {
  const [name, setName] = useState('')
  const values = effectiveVariables(profile.variables, target)
  const normalized = name.trim().toUpperCase()
  const valid =
    VARIABLE_NAME.test(normalized) && !BUILT_INS.has(normalized) && !Object.hasOwn(values, normalized)
  const custom = Object.keys(values)
    .filter((key) => !BUILT_INS.has(key))
    .sort()
  const overridden = (key: string) =>
    !!target && (key === 'RHOST' ? !!target.address : Object.hasOwn(target.vars, key))

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {DEFAULT_VARIABLES.map((variable) => (
          <Input
            key={variable.name}
            label={<span className="font-mono">{variable.name}</span>}
            description={overridden(variable.name) ? `From saved target ${target?.name}` : variable.hint}
            value={values[variable.name] ?? ''}
            disabled={overridden(variable.name)}
            onChange={(event) => onChange(variable.name, event.target.value)}
            className="font-mono"
            spellCheck={false}
            autoComplete="off"
          />
        ))}
        {custom.map((key) => (
          <div key={key} className="flex items-end gap-2">
            <Input
              label={<span className="font-mono">{key}</span>}
              description={overridden(key) ? `From saved target ${target?.name}` : undefined}
              value={values[key] ?? ''}
              disabled={overridden(key)}
              onChange={(event) => onChange(key, event.target.value)}
              className="font-mono"
              spellCheck={false}
              autoComplete="off"
            />
            <IconButton
              label={`Remove ${key}`}
              variant="danger"
              disabled={overridden(key)}
              onClick={() => onRemove(key)}
            >
              <Trash2 aria-hidden="true" />
            </IconButton>
          </div>
        ))}
      </div>
      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (!valid) return
          onChange(normalized, '')
          setName('')
        }}
      >
        <Input
          label="Add a variable"
          placeholder="e.g. WORDLIST"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="font-mono"
          spellCheck={false}
        />
        <Button type="submit" variant="secondary" disabled={!valid}>
          <Plus aria-hidden="true" className="size-4" /> Add
        </Button>
      </form>
    </div>
  )
}
