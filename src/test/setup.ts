import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

// jsdom implements no layout or scrolling APIs.
Element.prototype.scrollIntoView ??= function scrollIntoView() {}
window.scrollTo = () => {}
