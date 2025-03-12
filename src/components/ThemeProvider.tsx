'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Typy pro kontext
type ThemeContextType = {
  mode: 'light' | 'dark'
  toggleTheme: () => void
}

// Vytvoření kontextu s výchozími hodnotami
const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {},
})

// Hook pro použití tématu
export const useTheme = () => useContext(ThemeContext)

// Definice tmavého tématu
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
})

// Definice světlého tématu
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
})

// Komponenta poskytovatele tématu
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Stav pro režim tématu, výchozí je tmavý
  const [mode, setMode] = useState<'light' | 'dark'>('dark')

  // Funkce pro přepínání režimu
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
    // Uložit nastavení do localStorage
    localStorage.setItem('theme', mode === 'light' ? 'dark' : 'light')
  }

  // Načtení uloženého tématu při prvním vykreslení
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setMode(savedTheme)
    }
  }, [])

  // Vybrat aktivní téma
  const theme = mode === 'light' ? lightTheme : darkTheme

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
