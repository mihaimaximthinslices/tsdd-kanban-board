import { IconBoardBlue } from '../svg/icon-board.tsx'
import IconLightTheme from '../svg/icon-light-theme.tsx'
import IconDarkTheme from '../svg/icon-dark-theme.tsx'
import { Toggle } from './DashboardSidebar.tsx'

export function MobileSidebar({
  closeModalParrent,
}: {
  closeModalParrent: () => void
}) {
  const boardsNumber = 0
  return (
    <div
      data-cy="sidebar"
      className="w-[264px] min-h-[322px] bg-white dark:bg-black2 rounded-md pt-4 pb-4 shadow-md flex flex-col justify-between"
    >
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
            onClick={() => {
              closeModalParrent()
            }}
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
      </div>
    </div>
  )
}
