import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button, IconButton, Input } from '@kryv/teal'
import { VARIABLE_NAME, type Variables } from '../lib/variables'

export function TargetVariables({
  variables,
  onChange,
}: {
  variables: Variables
  onChange: (variables: Variables) => void
}) {
  const [name, setName] = useState('')
  const normalized = name.trim().toUpperCase()
  const valid = VARIABLE_NAME.test(normalized) && normalized !== 'RHOST' && !(normalized in variables)

  return (
    <div className="grid gap-3">
      {Object.keys(variables)
        .sort()
        .map((key) => (
          <div key={key} className="flex items-end gap-2">
            <Input
              label={<span className="font-mono">{key}</span>}
              value={variables[key] ?? ''}
              onChange={(event) => onChange({ ...variables, [key]: event.target.value })}
              className="font-mono"
              spellCheck={false}
              autoComplete="off"
            />
            <IconButton
              label={`Remove ${key}`}
              variant="danger"
              onClick={() =>
                onChange(Object.fromEntries(Object.entries(variables).filter(([item]) => item !== key)))
              }
            >
              <Trash2 />
            </IconButton>
          </div>
        ))}
      <form
        className="flex items-end gap-2"
        aria-describedby="target-var-hint"
        onSubmit={(event) => {
          event.preventDefault()
          if (!valid) return
          onChange({ ...variables, [normalized]: '' })
          setName('')
        }}
      >
        <Input
          label="Add a target variable"
          aria-describedby="target-var-hint"
          placeholder="NAME"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="font-mono"
          spellCheck={false}
        />
        <Button type="submit" variant="secondary" disabled={!valid}>
          Add
        </Button>
      </form>
      <p id="target-var-hint" className="-mt-1 text-xs text-teal-on-surface-variant">
        Overrides the global value while this target is active, e.g. USER or DOMAIN.
      </p>
    </div>
  )
}
