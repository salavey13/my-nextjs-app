'use client'
import React, { createContext, useState, useEffect } from 'react'

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export const defaultTheme = {
  colors: {
    secondary: { hsl: 'hsl(220, 100%, 8%)', hex: '#020728' },
    foreground: { hsl: 'hsl(184, 89%, 48%)', hex: '#11e6d0' },
    primary: { hsl: 'hsl(184, 89%, 48%)', hex: '#11e6d0' },
    background: { hsl: 'hsl(315, 100%, 80%)', hex: '#FFA9F3' },
    muted: { hsl: 'hsl(220, 72%, 15%)', hex: '#0b1b40' },
    accent: { hsl: 'hsl(270, 90%, 13%)', hex: '#1c063e' },
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