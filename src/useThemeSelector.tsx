let alreadySet = false
const initTheme = () => {
  return () => {
    if (!alreadySet) {
      if (
        localStorage.theme === 'dark' ||
        (!('theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      localStorage.theme = 'light'

      localStorage.theme = 'dark'

      localStorage.removeItem('theme')

      alreadySet = true
    }
  }
}
export const useThemeSelector = () => {
  initTheme()()
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
  }
  return {
    toggleTheme,
  }
}
