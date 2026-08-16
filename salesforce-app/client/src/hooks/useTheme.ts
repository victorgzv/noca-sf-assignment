import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
type ThemePreference = Theme | 'system'

const STORAGE_KEY = 'theme'
const darkMediaQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

function readStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

function resolveTheme(preference: ThemePreference): Theme {
  return preference === 'system' ? (darkMediaQuery().matches ? 'dark' : 'light') : preference
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readStoredPreference)
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(preference))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (preference !== 'system') return
    const media = darkMediaQuery()
    const onChange = () => setTheme(resolveTheme('system'))
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [preference])

  const setThemePreference = useCallback((next: ThemePreference) => {
    setPreference(next)
    setTheme(resolveTheme(next))
    if (next === 'system') {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, next)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemePreference(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setThemePreference])

  return { theme, preference, setThemePreference, toggleTheme }
}
