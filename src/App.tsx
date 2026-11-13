import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import type { Content } from './lib/content'
import { CheatPage } from './pages/CheatPage'
import { HomePage } from './pages/HomePage'
import { NotFound } from './pages/NotFound'
import { SectionPage } from './pages/SectionPage'
import { EncodersPage } from './pages/tools/EncodersPage'
import { ParserPage } from './pages/tools/ParserPage'
import { PlaybookPage, PlaybooksPage } from './pages/tools/PlaybooksPage'
import { TargetPage, TargetsPage } from './pages/tools/TargetsPage'
import type { Tools } from './tools-source'

export function App({ content, tools }: { content: Content; tools: Tools }) {
  return (
    <Routes>
      <Route element={<Layout content={content} tools={tools} />}>
        <Route index element={<HomePage content={content} />} />
        {/* Static /tools routes outrank the dynamic content routes, so "tools" is a reserved section name. */}
        <Route path="tools/targets" element={<TargetsPage />} />
        <Route path="tools/targets/:id" element={<TargetPage content={content} tools={tools} />} />
        <Route path="tools/parse" element={<ParserPage content={content} tools={tools} />} />
        <Route path="tools/playbooks" element={<PlaybooksPage tools={tools} />} />
        <Route path="tools/playbooks/:id" element={<PlaybookPage content={content} tools={tools} />} />
        <Route path="tools/encode" element={<EncodersPage />} />
        <Route path=":section" element={<SectionPage content={content} />} />
        <Route path=":section/:page" element={<CheatPage content={content} />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
