import { Navigate, Route, Routes, useParams, useSearchParams } from 'react-router'
import { Layout } from './components/Layout'
import type { Content } from './lib/content'
import { CheatPage } from './pages/CheatPage'
import { HomePage } from './pages/HomePage'
import { NotFound } from './pages/NotFound'
import { SectionPage } from './pages/SectionPage'
import { SetupPage } from './pages/SetupPage'
import { EncodersPage } from './pages/tools/EncodersPage'
import { CommandsPage } from './pages/tools/CommandsPage'
import { NotebookPage } from './pages/tools/NotebookPage'
import { ParserPage } from './pages/tools/ParserPage'
import { PlaybookPage, PlaybooksPage } from './pages/tools/PlaybooksPage'
import type { Tools } from './tools-source'

function LegacyPlaybookRedirect() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const search = params.toString()
  return <Navigate replace to={`/companions/${id}${search ? `?${search}` : ''}`} />
}

export function App({ content, tools }: { content: Content; tools: Tools }) {
  return (
    <Routes>
      <Route element={<Layout content={content} tools={tools} />}>
        <Route index element={<HomePage content={content} tools={tools} />} />
        <Route path="setup" element={<SetupPage tools={tools} />} />
        {/* Static /tools routes outrank the dynamic content routes, so "tools" is a reserved section name. */}
        <Route path="tools/targets/*" element={<Navigate replace to="/" />} />
        <Route path="tools/parse" element={<ParserPage content={content} tools={tools} />} />
        <Route path="companions" element={<PlaybooksPage tools={tools} />} />
        <Route path="companions/:id" element={<PlaybookPage content={content} tools={tools} />} />
        <Route path="tools/playbooks" element={<Navigate replace to="/companions" />} />
        <Route path="tools/playbooks/:id" element={<LegacyPlaybookRedirect />} />
        <Route path="tools/encode" element={<EncodersPage />} />
        <Route path="tools/commands" element={<CommandsPage content={content} tools={tools} />} />
        <Route path="tools/notebook" element={<NotebookPage />} />
        <Route path=":section" element={<SectionPage content={content} />} />
        <Route path=":section/:page" element={<CheatPage content={content} />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
