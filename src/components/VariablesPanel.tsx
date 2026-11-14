import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, Dialog, IconButton, Input, Select } from '@kryv/teal'
import { Link } from 'react-router'
import { DEFAULT_VARIABLES, VARIABLE_NAME } from '../lib/variables'
import { useAppState } from '../state'

interface VariablesPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NO_TARGET = '__none__'

function ActiveTargetPicker({ onNavigate }: { onNavigate: () => void }) {
  const { targets, activeTarget, setActiveTarget } = useAppState()
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-teal-outline-variant/40 bg-teal-surface-container-low p-4">
      <Select
        aria-label="Active target"
        value={activeTarget?.id ?? NO_TARGET}
        onValueChange={(value) => setActiveTarget(value === NO_TARGET ? null : value)}
        options={[
          { value: NO_TARGET, label: 'No active target' },
          ...targets.map((target) => ({
            value: target.id,
            label: `${target.name}${target.address ? ` (${target.address})` : ''}`,
          })),
        ]}
      />
      <p className="text-xs text-teal-on-surface-variant">
        {activeTarget
          ? "RHOST and this target's own variables override the globals below."
          : 'Pick a target to fill RHOST from it.'}{' '}
        <Link to="/tools/targets" onClick={onNavigate} className="prose-link">
          Manage targets
        </Link>
      </p>
    </div>
  )
}

function CustomVariableForm() {
  const { globals: variables, setVariable } = useAppState()
  const [name, setName] = useState('')
  const normalized = name.trim().toUpperCase()
  const valid = VARIABLE_NAME.test(normalized) && !(normalized in variables)

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!valid) return
        setVariable(normalized, '')
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
        <Plus aria-hidden="true" className="size-4" />
        Add
      </Button>
    </form>
  )
}

/**
 * Global values swapped into every `{{NAME}}` placeholder in code blocks, so
 * a command is copy-paste ready for the current target.
 */
export function VariablesPanel({ open, onOpenChange }: VariablesPanelProps) {
  const {
    globals: variables,
    variables: effective,
    setVariable,
    removeVariable,
    activeTarget,
  } = useAppState()
  const overridden = (name: string) =>
    !!activeTarget &&
    ((name === 'RHOST' && !!activeTarget.address) || (activeTarget.vars[name]?.trim() ?? '') !== '')
  const defaults = new Set(DEFAULT_VARIABLES.map((item) => item.name))
  const custom = Object.keys(variables)
    .filter((name) => !defaults.has(name))
    .sort()

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      placement="right"
      title="Target and variables"
      description="Filled into {{NAME}} placeholders in every command. Saved in this browser."
    >
      <div className="flex flex-col gap-4">
        <ActiveTargetPicker onNavigate={() => onOpenChange(false)} />
        {DEFAULT_VARIABLES.map((item) => (
          <Input
            key={item.name}
            label={<span className="font-mono">{item.name}</span>}
            description={
              overridden(item.name)
                ? `${item.hint} - using ${activeTarget?.name}'s value while it is active`
                : item.hint
            }
            placeholder={overridden(item.name) ? effective[item.name] : undefined}
            value={variables[item.name] ?? ''}
            onChange={(event) => setVariable(item.name, event.target.value)}
            className="font-mono"
            spellCheck={false}
            autoComplete="off"
          />
        ))}
        {custom.map((name) => (
          <div key={name} className="flex items-end gap-2">
            <Input
              label={<span className="font-mono">{name}</span>}
              value={variables[name] ?? ''}
              onChange={(event) => setVariable(name, event.target.value)}
              className="font-mono"
              spellCheck={false}
              autoComplete="off"
            />
            <IconButton label={`Remove ${name}`} variant="danger" onClick={() => removeVariable(name)}>
              <Trash2 />
            </IconButton>
          </div>
        ))}
        <CustomVariableForm />
      </div>
    </Dialog>
  )
}
