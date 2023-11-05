import { IconBoard, IconBoardBlue, IconBoardWhite } from '../svg/icon-board.tsx'
import IconLightTheme from '../svg/icon-light-theme.tsx'
import IconDarkTheme from '../svg/icon-dark-theme.tsx'
import { Toggle } from './DashboardSidebar.tsx'
import { useContext } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'
import { clsx } from 'clsx'
import { useBoards } from '../hooks/useBoards.tsx'

export function MobileSidebar({
  closeModalParrent,
}: {
  closeModalParrent: () => void
}) {
  const { setDashboardState, selectedBoard } = useContext(DashboardContext)
  const { boards, isLoading: isBoardsLoading } = useBoards()

  function selectBoard(id: string) {
    setDashboardState!((old) => ({
      ...old,
      selectedBoard: id,
    }))
  }

  return (
    <div
      data-cy="sidebar"
      className="w-[264px] min-h-[322px] bg-white dark:bg-black2 rounded-md pt-4 pb-4 shadow-md flex flex-col justify-between"
    >
      <div className="max-w-[240px]">
        <p
          data-cy="sidebar-all-boards-counter"
          className=" pl-6 font-plusJSans text-headingS text-white4 tracking-headingS mb-[19px]"
        >
          ALL BOARDS {boards ? '(' + boards.length + ')' : ''}
        </p>
        <div className="flex flex-col gap-0">
          {isBoardsLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from([1]).map((key) => {
                return (
                  <div
                    key={key}
                    className="flex pl-4 items-center cursor-pointer"
                  >
                    <div
                      role="status"
                      className="w-full animate-pulse flex flex-col gap-6"
                    >
                      <div className="bg-gray-200 rounded-md dark:bg-black1 w-full h-8"></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            boards &&
            boards.map(({ boardName, id }) => {
              return (
                <div
                  onClick={() => {
                    selectBoard(id)
                  }}
                  key={id}
                  className={clsx(
                    'w-full pl-4 pt-[13px] pb-[13px] flex items-start justify-start cursor-pointer',
                    id === selectedBoard
                      ? 'bg-blue2 rounded-r-3xl'
                      : 'bg-white dark:bg-black2',
                  )}
                >
                  <div className="flex gap-[16px] pl-2 items-center cursor-pointer">
                    <div>
                      {id === selectedBoard ? (
                        <IconBoardWhite />
                      ) : (
                        <IconBoard />
                      )}
                    </div>
                    <div
                      data-cy="sidebar-create-new-board-button"
                      className={clsx(
                        'font-plusJSans text-headingM',
                        id === selectedBoard ? 'text-white' : 'text-white4',
                      )}
                    >
                      {boardName}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div
          onClick={() => {
            closeModalParrent()
            setDashboardState!((old) => ({
              ...old,
              showAddNewBoardModal: true,
            }))
          }}
          className="w-full bg-white dark:bg-black2 pl-4 pt-[13px] pb-[13px] flex items-start justify-start cursor-pointer"
        >
          <div className="flex gap-[16px] pl-2 items-center cursor-pointer">
            <div>
              <IconBoardBlue />
            </div>
            <div
              data-cy="sidebar-create-new-board-button"
              className="font-plusJSans text-headingM text-blue2"
            >
              + Create New Board
            </div>
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
