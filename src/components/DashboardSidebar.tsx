import { IconBoardBlue } from '../svg/icon-board.tsx'
import { useEffect, useState } from 'react'
import IconDarkTheme from '../svg/icon-dark-theme.tsx'
import IconLightTheme from '../svg/icon-light-theme.tsx'
import { useThemeSelector } from '../useThemeSelector.tsx'
import IconHideSidebar from '../svg/icon-hide-sidebar.tsx'

export function Toggle() {
  const [enabled, setEnabled] = useState(true)
  const { toggleTheme } = useThemeSelector()
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    if (!isDark) {
      setEnabled(false)
    }
  }, [])

  return (
    <div
      data-cy="sidebar-switch-theme-button"
      className="relative flex flex-col items-center justify-center h-fit max-h-0.5"
    >
      <div className="flex">
        <label className="inline-flex relative items-center cursor-pointer ">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            readOnly
          />
          <div
            onClick={() => {
              setEnabled(!enabled)
              toggleTheme(enabled)
            }}
            className=" w-11 h-6 bg-blue2 rounded-full peer  peer-focus:ring-blue2  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
          ></div>
        </label>
      </div>
    </div>
  )
}
export function DashboardSidebar() {
  const boardsNumber = 0
  return (
    <div data-cy="sidebar" className="flex flex-col grow w-fit ">
      <div className="flex-1 grow flex flex-col h-full md:w-[261px] 1xl:w-[300px] bg-white border-r border-r-white3 dark:bg-black2 dark:border-r-black1 pt-[31px] pb-8 justify-between">
        <div>
          <p
            data-cy="sidebar-all-boards-counter"
            className=" pl-6 font-plusJSans text-headingS text-white4 tracking-headingS mb-[19px]"
          >
            ALL BOARDS ({boardsNumber})
          </p>

          <div className="flex gap-[16px] pl-6 items-center cursor-pointer">
            <div>
              <IconBoardBlue />
            </div>
            <div
              data-cy="sidebar-create-new-board-button"
              className=" font-plusJSans text-headingM text-blue2"
            >
              + Create New Board
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center ">
          <div className="flex h-12 w-[235px] 1xl:w-[251] bg-white3 dark:bg-black3 rounded-md items-center justify-around px-10">
            <IconLightTheme />
            <Toggle />
            <IconDarkTheme />
          </div>
          <div
            data-cy="hide-sidebar-button"
            className="flex gap-[15px] items-center justify-start w-full pl-6 1xl:pl-11 pt-[22px] pb-[11px]"
          >
            <div>
              <IconHideSidebar />
            </div>
            <span className="font-plusJSans text-headingM text-white4">
              Hide Sidebar
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
