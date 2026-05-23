import { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'isw-__PROJECT_SLUG__-theme'

const THEMES = [
  { id: 'default',    label: 'Default',     icon: 'fa-light fa-sun' },
  { id: 'dark',       label: 'Dark',        icon: 'fa-light fa-moon' },
  { id: 'soft',       label: 'Soft',        icon: 'fa-light fa-leaf' },
  { id: 'light-blue', label: 'Light Blue',  icon: 'fa-light fa-droplet' },
  { id: 'light-green',label: 'Light Green', icon: 'fa-light fa-seedling' },
]

const ThemeContext = createContext({ theme: 'default', setTheme: () => {}, themes: THEMES })

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() =>
    localStorage.getItem(STORAGE_KEY) || 'default'
  )

  const setTheme = (id) => {
    setThemeState(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
