import { useContext } from 'react'
import { ThemeContext, defaultTheme } from '@/context/ThemeContext'

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
      console.warn('useTheme must be used within a ThemeProvider')
      return { theme: defaultTheme, setTheme: () => {} }
    }
    return context
  }