import React, { useEffect, useState } from 'react';
import { FiMoon, FiSun } from "react-icons/fi";
import { Switch } from '../ui';

const SunIcon: React.FC = () => (
  <FiSun className="w-3.5 h-3.5 text-amber-500" aria-hidden />
)

const MoonIcon: React.FC = () => (
  <FiMoon className="w-3.5 h-3.5 text-indigo-600" aria-hidden />
)

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored as 'light' | 'dark'
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    try {
      localStorage.setItem('theme', theme)
    } catch { }
  }, [theme])

  return (
    <Switch
      name="theme-toggle"
      value={theme === 'dark'}
      onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      color="primary"
      size="md"
      thumbIcon={(checked) => checked ? <MoonIcon /> : <SunIcon />}
      containerClassName="w-fit flex items-center justify-center -mt-1"
    />
  )
}

export default ThemeToggle
