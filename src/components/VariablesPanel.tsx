import { useState } from 'react'
import { Check, Crosshair } from 'lucide-react'
import { Badge, Button, Dialog, Select, Tabs } from '@kryv/teal'
import { Link } from 'react-router'
import type { VariableProfile } from '../lib/profiles'
import { useAppState } from '../state'
import { ProfileVariables } from './ProfileVariables'

interface VariablesPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NO_TARGET = '__none__'

function ProfileEditor({ profile, onNavigate }: { profile: VariableProfile; onNavigate: () => void }) {
  const { targets, defaultProfile, setDefaultProfile, updateProfile } = useAppState()
  const target = targets.find((item) => item.id === profile.targetId)
  const isDefault = defaultProfile.id === profile.id

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-teal-headline text-lg font-bold">{profile.name} variables</h3>
          <p className="mt-1 text-xs text-teal-on-surface-variant">
            {isDefault
              ? 'Changes apply to every command.'
              : 'Make this profile default when you start working on it.'}
          </p>
        </div>
        <Button
          size="sm"
          disabled={isDefault}
          aria-label={isDefault ? `${profile.name} is default` : `Make ${profile.name} default`}
          onClick={() => setDefaultProfile(profile.id)}
        >
          {isDefault ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <Crosshair aria-hidden="true" className="size-4" />
          )}
          {isDefault ? 'Default' : 'Make default'}
        </Button>
      </div>
      <div className="grid gap-2 rounded-xl border border-teal-outline-variant/40 bg-teal-surface-container-low p-4">
        <Select
          aria-label={`Target for ${profile.name}`}
          value={target?.id ?? NO_TARGET}
          onValueChange={(value) =>
            updateProfile(profile.id, { targetId: value === NO_TARGET ? null : value })
          }
          options={[
            { value: NO_TARGET, label: 'Use profile values' },
            ...targets.map((item) => ({
              value: item.id,
              label: `${item.name}${item.address ? ` (${item.address})` : ''}`,
            })),
          ]}
        />
        <p className="text-xs text-teal-on-surface-variant">
          {target ? 'Saved-target fields take priority.' : 'Optionally use a saved target for this profile.'}{' '}
          <Link
            to={target ? `/tools/targets/${target.id}` : '/tools/targets'}
            onClick={onNavigate}
            className="prose-link"
          >
            {target ? 'Edit saved target' : 'Manage targets'}
          </Link>
        </p>
      </div>
      <ProfileVariables
        profile={profile}
        target={target}
        onChange={(name, value) =>
          updateProfile(profile.id, { variables: { ...profile.variables, [name]: value } })
        }
        onRemove={(name) =>
          updateProfile(profile.id, {
            variables: Object.fromEntries(Object.entries(profile.variables).filter(([key]) => key !== name)),
          })
        }
      />
    </div>
  )
}

function ProfileTabs({ onNavigate }: { onNavigate: () => void }) {
  const { profiles, defaultProfile } = useAppState()
  const [editingId, setEditingId] = useState(defaultProfile.id)
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">
          <Crosshair aria-hidden="true" className="mr-1 size-3" /> Default
        </Badge>
        <p role="status" className="text-sm font-semibold">
          Commands use {defaultProfile.name}
        </p>
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
          content: <ProfileEditor profile={profile} onNavigate={onNavigate} />,
        }))}
      />
    </div>
  )
}

/** Browsing a tab edits that profile; only Make default changes the command context. */
export function VariablesPanel({ open, onOpenChange }: VariablesPanelProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      placement="right"
      width="min(42rem,calc(100vw - 1.5rem))"
      title="Target and variables"
      description="Separate values for AD and each box. Profiles and the default are saved only in this browser."
    >
      <ProfileTabs onNavigate={() => onOpenChange(false)} />
    </Dialog>
  )
}
