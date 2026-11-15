import { useState } from 'react'
import { Check, Crosshair, Plus } from 'lucide-react'
import { Badge, Button, Dialog, Input, Tabs } from '@kryv/teal'
import type { VariableProfile } from '../lib/profiles'
import { SHARED_VARIABLES } from '../lib/variables'
import { useAppState } from '../state'
import { ProfileVariables } from './ProfileVariables'

interface VariablesPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function NameEditor({ profile }: { profile: VariableProfile }) {
  const { updateProfile } = useAppState()
  const [name, setName] = useState(profile.name)
  const commit = () => {
    const trimmed = name.trim()
    if (trimmed && trimmed !== profile.name) {
      updateProfile(profile.id, { name: trimmed })
      setName(trimmed)
    } else {
      setName(profile.name)
    }
  }
  return (
    <Input
      label="Profile name"
      description="Renames this tab; saved with the other profile values in this browser."
      value={name}
      onChange={(event) => setName(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
      }}
      className="max-w-48"
      autoComplete="off"
    />
  )
}

function SharedVariables() {
  const { sharedVariables, setSharedVariable } = useAppState()
  return (
    <div className="grid gap-4 rounded-xl border border-teal-outline-variant/40 bg-teal-surface-container-low p-4 sm:grid-cols-2">
      {SHARED_VARIABLES.map((variable) => (
        <Input
          key={variable.name}
          label={variable.label}
          description={variable.hint}
          value={sharedVariables[variable.name] ?? ''}
          onChange={(event) => setSharedVariable(variable.name, event.target.value)}
          className="font-mono"
          spellCheck={false}
          autoComplete="off"
        />
      ))}
      <p className="text-xs text-teal-on-surface-variant sm:col-span-2">
        Shared across every box. Each profile keeps its own IP address, domain, username and password.
      </p>
    </div>
  )
}

function ProfileEditor({ profile }: { profile: VariableProfile }) {
  const { defaultProfile, setDefaultProfile, updateProfile } = useAppState()
  const isDefault = defaultProfile.id === profile.id

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-teal-headline text-lg font-bold">{profile.name}</h3>
          <p className="mt-1 text-xs text-teal-on-surface-variant">
            {isDefault
              ? 'Changes apply to every command.'
              : 'Make this profile default when you start working on it.'}
          </p>
        </div>
        <Button size="sm" disabled={isDefault} onClick={() => setDefaultProfile(profile.id)}>
          {isDefault ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <Crosshair aria-hidden="true" className="size-4" />
          )}
          {isDefault ? 'Default' : `Make ${profile.name} default`}
        </Button>
      </div>
      <NameEditor key={profile.id} profile={profile} />
      <ProfileVariables
        profile={profile}
        onChange={(name, value) =>
          updateProfile(profile.id, { variables: { ...profile.variables, [name]: value } })
        }
      />
    </div>
  )
}

function ProfileTabs() {
  const { profiles, defaultProfile, addBox } = useAppState()
  const [editingId, setEditingId] = useState(defaultProfile.id)
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <SharedVariables />
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">
          <Crosshair aria-hidden="true" className="mr-1 size-3" /> Default
        </Badge>
        <p role="status" className="text-sm font-semibold">
          Commands use {defaultProfile.name}
        </p>
        <Button size="sm" variant="secondary" className="sm:ml-auto" onClick={() => setEditingId(addBox())}>
          <Plus aria-hidden="true" className="size-4" /> Add box
        </Button>
      </div>
      <Tabs
        aria-label="Variable profiles"
        value={editingId}
        onValueChange={setEditingId}
        items={profiles.map((profile) => ({
          value: profile.id,
          label: (
            <span className="inline-flex items-center gap-1.5">
              {profile.name}
              {profile.id === defaultProfile.id ? (
                <span aria-hidden="true" className="size-1.5 rounded-full bg-teal-primary" />
              ) : null}
            </span>
          ),
          content: <ProfileEditor profile={profile} />,
        }))}
      />
    </div>
  )
}

export function VariablesPanel({ open, onOpenChange }: VariablesPanelProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      placement="right"
      width="min(42rem,calc(100vw - 1.5rem))"
      title="Machine variables"
      description="Basic values per box with shared attacker IP and port. Profiles and the default are saved only in this browser."
    >
      <ProfileTabs />
    </Dialog>
  )
}
