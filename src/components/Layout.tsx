import { useEffect, useRef, useState } from 'react'
import { Crosshair, Keyboard, Menu as MenuIcon, Pin, Search, Terminal, X } from 'lucide-react'
import {
  IconButton,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  ThemeToggle,
  Toaster,
  TooltipProvider,
  TopBar,
  TopBarActions,
  TopBarBrand,
  TopBarSearch,
} from '@kryv/teal'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import type { Content } from '../lib/content'
import type { Tools } from '../tools-source'
import { TOOL_LINKS } from '../tools-nav'
import { pageHref } from '../lib/links'
import { useHotkeys } from '../hooks'
import { useAppState } from '../state'
import { Key } from './Key'
import { SearchPalette } from './SearchPalette'
import { ShortcutsDialog } from './ShortcutsDialog'
import { VariablesPanel } from './VariablesPanel'

const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.userAgent)

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <NavLink
      to="/"
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-primary"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-teal-primary text-teal-on-primary">
        <Terminal aria-hidden="true" className="size-4" />
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="font-teal-headline text-base font-extrabold leading-none text-teal-on-surface">
          OffSec Cheatsheets
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-primary">
          OSCP / PEN-200
        </span>
      </span>
    </NavLink>
  )
}

function Navigation({ content, open, onClose }: { content: Content; open: boolean; onClose: () => void }) {
  const { pathname } = useLocation()
  const { pins } = useAppState()
  const pinned = pins.flatMap((slug) => content.page(slug) ?? [])
  const firstLink = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (open) firstLink.current?.focus()
  }, [open])

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          tabIndex={-1}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      ) : null}
      <Sidebar
        aria-label="Cheatsheet sections"
        className={`app-sidebar fixed inset-y-0 left-0 z-40 w-72 bg-teal-surface transition-transform duration-200 motion-reduce:transition-none lg:translate-x-0 ${
          open ? 'translate-x-0' : 'max-lg:invisible -translate-x-full'
        }`}
      >
        <SidebarHeader>
          <Brand onNavigate={onClose} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarSection label="Tools">
            {TOOL_LINKS.map((tool, index) => (
              <SidebarItem
                key={tool.to}
                ref={index === 0 ? firstLink : undefined}
                as={NavLink}
                to={tool.to}
                active={pathname === tool.to || pathname.startsWith(`${tool.to}/`)}
                onClick={onClose}
                icon={<tool.icon aria-hidden="true" className="size-4" />}
              >
                {tool.label}
              </SidebarItem>
            ))}
          </SidebarSection>
          {pinned.length > 0 ? (
            <SidebarSection label="Pinned">
              {pinned.map((page) => (
                <SidebarItem
                  key={page.slug}
                  as={NavLink}
                  to={pageHref(page.slug)}
                  active={pathname === `/${page.slug}`}
                  onClick={onClose}
                  icon={<Pin aria-hidden="true" className="size-3.5" />}
                >
                  {page.title}
                </SidebarItem>
              ))}
            </SidebarSection>
          ) : null}
          {content.sections.map((section) => (
            <SidebarSection key={section.id} label={section.title}>
              {section.pages.map((page) => (
                <SidebarItem
                  key={page.slug}
                  as={NavLink}
                  to={pageHref(page.slug)}
                  active={pathname === `/${page.slug}`}
                  onClick={onClose}
                  title={page.title}
                >
                  {page.title}
                </SidebarItem>
              ))}
            </SidebarSection>
          ))}
        </SidebarContent>
      </Sidebar>
    </>
  )
}

function VariablesButton({ onClick }: { onClick: () => void }) {
  const { variables, activeTarget } = useAppState()
  const target = variables.RHOST?.trim()
  const label = activeTarget
    ? `${activeTarget.name}${target && target !== activeTarget.name ? ` ${target}` : ''}`
    : target
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ? `Edit variables, target ${label}` : 'Edit variables'}
      className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-teal-on-surface-variant transition-colors hover:bg-teal-surface-container-high hover:text-teal-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-primary"
    >
      <Crosshair aria-hidden="true" className="size-4" />
      {label ? (
        <span className="hidden max-w-48 truncate font-mono text-xs font-semibold text-teal-primary sm:inline">
          {label}
        </span>
      ) : (
        <span className="hidden sm:inline">Variables</span>
      )}
    </button>
  )
}

export function Layout({ content, tools }: { content: Content; tools: Tools }) {
  const [navOpen, setNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [variablesOpen, setVariablesOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const navigate = useNavigate()
  const { togglePin } = useAppState()

  // Read the page from the URL at keypress time, not from the last render:
  // router navigations commit asynchronously, so a quick "] [" would
  // otherwise run "[" against the page being left. The hash router updates
  // location.hash synchronously.
  const currentPage = () => content.page(window.location.hash.replace(/^#\/?/, '').split('?')[0] ?? '')

  useHotkeys({
    'mod+k': () => setSearchOpen((value) => !value),
    '/': () => setSearchOpen(true),
    '?': () => setShortcutsOpen(true),
    v: () => setVariablesOpen(true),
    h: () => navigate('/'),
    '[': () => {
      const current = currentPage()
      const prev = current && content.neighbours(current.slug).prev
      if (prev) navigate(pageHref(prev.slug))
    },
    ']': () => {
      const current = currentPage()
      const next = current ? content.neighbours(current.slug).next : content.pages[0]
      if (next) navigate(pageHref(next.slug))
    },
    p: () => {
      const current = currentPage()
      if (current) togglePin(current.slug)
    },
  })

  useEffect(() => {
    if (!navOpen) return
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setNavOpen(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navOpen])

  return (
    <TooltipProvider>
      <div className="min-h-dvh bg-teal-background text-teal-on-surface">
        <a
          href="#main-content"
          onClick={(event) => {
            event.preventDefault()
            document.getElementById('main-content')?.focus()
          }}
          className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-lg bg-teal-primary px-4 py-2 font-semibold text-teal-on-primary focus:translate-y-0"
        >
          Skip to content
        </a>
        <Navigation content={content} open={navOpen} onClose={() => setNavOpen(false)} />
        <div className="lg:pl-72">
          <TopBar sticky className="app-topbar bg-teal-surface/90 backdrop-blur">
            <TopBarBrand className="lg:hidden">
              <IconButton
                label={navOpen ? 'Close navigation' : 'Open navigation'}
                onClick={() => setNavOpen((value) => !value)}
              >
                {navOpen ? <X /> : <MenuIcon />}
              </IconButton>
            </TopBarBrand>
            <span
              title="Current certification: OSCP (PEN-200)"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-teal-primary/30 bg-teal-primary/10 px-2.5 py-1.5 text-[11px] font-bold tracking-wider text-teal-primary"
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
              OSCP
            </span>
            <TopBarSearch className="min-w-0">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-teal-outline-variant/50 bg-teal-surface-container-low px-3 text-sm text-teal-on-surface-variant transition-colors hover:border-teal-outline hover:text-teal-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-primary max-[360px]:justify-center max-[360px]:gap-0"
              >
                <Search aria-hidden="true" className="size-4 shrink-0" />
                <span className="truncate max-[360px]:sr-only">Search</span>
                <span className="ml-auto hidden items-center gap-1 sm:flex" aria-hidden="true">
                  <Key>{isMac ? '⌘' : 'Ctrl'}</Key>
                  <Key>K</Key>
                </span>
              </button>
            </TopBarSearch>
            <TopBarActions>
              <VariablesButton onClick={() => setVariablesOpen(true)} />
              <IconButton
                label="Keyboard shortcuts"
                className="max-sm:hidden"
                onClick={() => setShortcutsOpen(true)}
              >
                <Keyboard />
              </IconButton>
              <ThemeToggle />
            </TopBarActions>
          </TopBar>
          <Outlet />
        </div>
        <SearchPalette content={content} tools={tools} open={searchOpen} onOpenChange={setSearchOpen} />
        <VariablesPanel open={variablesOpen} onOpenChange={setVariablesOpen} />
        <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
        <Toaster />
      </div>
    </TooltipProvider>
  )
}
