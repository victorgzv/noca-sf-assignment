import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// jsdom does not implement matchMedia; components/hooks that read the
// prefers-color-scheme media query need this to run under test.
window.matchMedia =
  window.matchMedia ||
  function matchMedia(query: string): MediaQueryList {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList
  }

afterEach(() => {
  cleanup()
})
