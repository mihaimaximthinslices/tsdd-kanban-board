import IconShowSidebar from '../svg/icon-show-sidebar.tsx'
import { Dispatch, SetStateAction } from 'react'

export function ShowSidebarSticky({
  setShowSidebar,
}: {
  setShowSidebar: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <div
      onClick={() => setShowSidebar(true)}
      data-cy="show-sidebar-button"
      className="cursor-pointer absolute bottom-8 left-0 w-[56px] h-[48px] rounded-r-3xl bg-blue2 flex items-center justify-center z-20"
    >
      <div className="pr-2">
        <IconShowSidebar />
      </div>
    </div>
  )
}
