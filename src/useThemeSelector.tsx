let alreadySet = false
const initTheme = () => {
  return () => {
    if (!alreadySet) {
      const currentTheme = localStorage.getItem('kanban-theme')
      if (currentTheme === 'light') {
        document.documentElement.classList.remove('dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('dark')
      }

      alreadySet = true
    }
  }
}
export const useThemeSelector = () => {
  initTheme()()
  const toggleTheme = (dark: boolean) => {
    console.log(dark)

    if (document.documentElement.classList.contains('dark')) {
      localStorage.setItem('kanban-theme', 'light')
    } else {
      localStorage.setItem('kanban-theme', 'dark')
    }

    document.documentElement.classList.toggle('dark')
  }
  return {
    toggleTheme,
  }
}
