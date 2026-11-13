import { render } from '@testing-library/react'
import { Toaster, TooltipProvider } from '@kryv/teal'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { AppStateProvider } from '../state'

export function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

export function renderApp(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppStateProvider>
        <TooltipProvider>
          <Routes>
            <Route path="*" element={<>{ui}<LocationProbe /></>} />
          </Routes>
          <Toaster />
        </TooltipProvider>
      </AppStateProvider>
    </MemoryRouter>,
  )
}
