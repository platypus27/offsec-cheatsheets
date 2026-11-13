import { Alert } from '@kryv/teal'

export function ToolProblems({ problems }: { problems: string[] }) {
  if (problems.length === 0) return null
  return (
    <Alert variant="warning" title="Some rule or playbook files have problems" className="mb-6">
      <ul className="mt-1 list-disc space-y-0.5 pl-5 font-mono text-xs">
        {problems.map((problem) => (
          <li key={problem}>{problem}</li>
        ))}
      </ul>
    </Alert>
  )
}
