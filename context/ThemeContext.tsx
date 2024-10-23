'use client'
import React, { createContext, useState, useEffect } from 'react'

export const defaultTheme = {
  colors: {
    secondary: 'hsl(220, 100%, 8%)', // #020728
    foreground: 'hsl(184, 89%, 48%)', // #11e6d0
    primary: 'hsl(184, 89%, 48%)', // #11e6d0
    background: 'hsl(315, 100%, 80%)', // #FFA9F3
    muted: 'hsl(220, 72%, 15%)', // #0b1b40
    accent: 'hsl(270, 90%, 13%)', // #1c063e
  },
}

export const ThemeContext = createContext<{
  theme: typeof defaultTheme
  setTheme: React.Dispatch<React.SetStateAction<typeof defaultTheme>>
}>({
  theme: defaultTheme,
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState(defaultTheme)

  useEffect(() => {
    // You could load the theme from localStorage here, or from an API
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}