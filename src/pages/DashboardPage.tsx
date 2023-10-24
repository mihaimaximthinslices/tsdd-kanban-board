import DashboardNavbar from '../components/DashboardNavbar.tsx'
import { useThemeSelector } from '../useThemeSelector.tsx'
import { DashboardSidebar } from '../components/DashboardSidebar.tsx'
import { useState } from 'react'
import useWindowDimensions from '../hooks/useWindowDimensions.tsx'
import { ShowSidebarSticky } from '../components/ShowSidebarSticky.tsx'

export const DashboardPage = () => {
  useThemeSelector()

  const [showSidebar, setShowSidebar] = useState(true)

  const { width } = useWindowDimensions()

  const canShowSidebar = width! >= 768

  if (width! < 768 && showSidebar) {
    setShowSidebar(false)
  }

  return (
    <div className="flex flex-col min-w-screen min-h-screen">
      <DashboardNavbar
        setShowSidebar={setShowSidebar}
        canShowSidebar={canShowSidebar}
        showSidebar={showSidebar}
      />
      <div className="grow flex bg-white2 dark:bg-black3">
        {showSidebar && <DashboardSidebar setShowSidebar={setShowSidebar} />}
        <div className="flex w-full flex-col grow justify-center items-center relative">
          {!showSidebar && canShowSidebar && (
            <ShowSidebarSticky setShowSidebar={setShowSidebar} />
          )}
          <div className="grow p-4 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <h1 className="font-plusJSans text-headingL text-white4 text-center">
                This board is empty. Create a new column to get started.
              </h1>
              <button
                data-cy="add-new-column-button"
                className="font-plusJSans text-headingM text-white bg-blue2 pl-[18px] pr-[18px] pt-[10px] pb-[10px] rounded-2xl w-fit text-center"
              >
                + Add New Column
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
