import type { Content } from './lib/content'
import { parsePlaybook, validatePlaybookLinks, type Playbook } from './lib/playbooks'
import { parseRules, validateRules, type Rule } from './lib/rules'
import { parseSetup, type SetupSection } from './lib/setup'

export interface Tools {
  rules: Rule[]
  playbooks: Playbook[]
  setup: SetupSection[]
  /** Problems in rule or playbook files, shown on the tool pages and failing the content check. */
  problems: string[]
}

export function buildTools(
  rulesSource: string,
  playbookSources: Record<string, string>,
  content: Content,
  setupSource = '',
): Tools {
  const { rules, errors: ruleErrors } = parseRules(rulesSource)
  const { sections: setup, errors: setupErrors } = parseSetup(setupSource)
  const problems = [
    ...ruleErrors.map((error) => `_rules.yaml: ${error}`),
    ...validateRules(rules, content).map((error) => `_rules.yaml: ${error}`),
    ...(setupSource.trim() ? setupErrors.map((error) => `_setup.yaml: ${error}`) : []),
  ]
  const playbooks: Playbook[] = []
  for (const [path, source] of Object.entries(playbookSources).sort(([a], [b]) => a.localeCompare(b))) {
    const id = path
      .split('/')
      .pop()!
      .replace(/\.ya?ml$/, '')
    const { playbook, errors } = parsePlaybook(id, source)
    problems.push(...errors.map((error) => `_playbooks/${id}.yaml: ${error}`))
    if (playbook) {
      playbooks.push(playbook)
      problems.push(
        ...validatePlaybookLinks(playbook, content).map((error) => `_playbooks/${id}.yaml: ${error}`),
      )
    }
  }
  return { rules, playbooks, setup, problems }
}
