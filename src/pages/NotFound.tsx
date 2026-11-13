import { Button, EmptyState } from '@kryv/teal'
import { Link } from 'react-router'

export function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-xl px-4 py-24 outline-none">
      <EmptyState
        status="404"
        title="Page not found"
        description="It may have been renamed or moved. Search usually finds it."
        action={
          <Button asChild variant="secondary">
            <Link to="/">Back to home</Link>
          </Button>
        }
      />
    </main>
  )
}
