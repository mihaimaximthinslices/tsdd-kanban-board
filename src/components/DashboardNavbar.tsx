import LogoMobile from '../svg/logo-mobile.tsx'
import IconChevronDown from '../svg/icon-chevron-down.tsx'
import IconAddTaskMobile from '../svg/icon-add-task-mobile.tsx'
import IconVerticalEllipsis from '../svg/icon-vertical-ellipsis.tsx'
import LogoDark from '../svg/logo-dark.tsx'
import LogoLight from '../svg/logo-light.tsx'
import { clsx } from 'clsx'
import { Dispatch, SetStateAction, useContext, useState } from 'react'
import { Modal } from '../modal/Modal.tsx'
import { MobileSidebar } from './MobileSidebar.tsx'
import { useBoards } from '../hooks/useBoards.tsx'
import { DashboardContext } from '../store/DashboardContext.tsx'
import { useBoardColumns } from '../hooks/useBoardColumns.tsx'

export default function DashboardNavbar({
  setShowSidebar,
  showSidebar,
  canShowSidebar,
}: {
  setShowSidebar: Dispatch<SetStateAction<boolean>>
  showSidebar: boolean
  canShowSidebar: boolean
}) {
  const { boards } = useBoards()
  const { promiseCounter } = useContext(DashboardContext)

  const { selectedBoard, setDashboardState } = useContext(DashboardContext)

  const foundSelectedBoard =
    boards && boards.find((board) => board.id === selectedBoard)

  const { boardColumns } = useBoardColumns(selectedBoard)

  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  return (
    <div className="w-full h-[64px] md:h-[80px] 1xl:h-[96px] bg-white dark:bg-black2 flex items-center justify-between border-b border-b-white3 dark:border-b-black1 md:border-b-0 pl-4 pr-4 md:pl-0 md:pr-0">
      <div
        onClick={() => canShowSidebar && setShowSidebar((prev) => !prev)}
        className={clsx(
          'flex gap-4 md:w-[201px] cursor-pointer h-full',
          showSidebar
            ? '1xl:w-[299px] md:w-[260px] justify-start pl-6 items-center'
            : 'items-center justify-center md:border-b border-b-white3 dark:border-b-black1',
        )}
      >
        <div data-cy="platform-logo" className="md:hidden">
          <LogoMobile />
        </div>
        <div
          data-cy="platform-logo-full"
          className="hidden md:block dark:md:hidden"
        >
          <LogoDark />
        </div>
        <div
          data-cy="platform-logo-full"
          className="hidden md:hidden dark:md:block"
        >
          <LogoLight />
        </div>
      </div>
      <div className="hidden md:block h-[64px] md:h-[80px] 1xl:h-[96px] w-[1px] bg-white3 dark:bg-black1" />
      <div className="h-full grow flex justify-between pl-4 md:pl-6 items-center md:border-b dark:border-b-black1">
        <div
          onClick={() => {
            !showMobileSidebar && setShowMobileSidebar(true)
          }}
          data-cy="platform-launch-dropdown"
          className={clsx(
            'flex gap-2 items-center md:hidden cursor-pointer',
            !showMobileSidebar ? 'cursor-pointer' : 'cursor-default',
          )}
        >
          <button
            className={clsx(
              'font-plusJSans text-headingL text-black dark:text-white',
              !foundSelectedBoard ? 'text-blue2 dark:text-blue2' : '',
            )}
          >
            {foundSelectedBoard ? foundSelectedBoard.boardName : 'Boards'}
          </button>
          <IconChevronDown />
          {promiseCounter > 0 && (
            <div className="flex items-center">
              <div className="flex items-center justify-center space-x-1 animate-pulse">
                <span className="font-plusJSans text-bodyM text-blue2">
                  Syncing...
                </span>
              </div>
            </div>
          )}

          {showMobileSidebar && (
            <Modal
              mobileTop={true}
              onClose={() => {
                setShowMobileSidebar(false)
              }}
            >
              <MobileSidebar
                closeModalParrent={() => setShowMobileSidebar(false)}
              />
            </Modal>
          )}
        </div>
        <div className=" gap-2 hidden md:flex items-center">
          <span className="font-plusJSans text-headingL text-black dark:text-white">
            {foundSelectedBoard ? foundSelectedBoard.boardName : ''}
          </span>
          {promiseCounter > 0 && (
            <div className="flex items-center">
              <div className="flex items-center justify-center space-x-1 animate-pulse">
                <span className="font-plusJSans text-headinM text-blue2">
                  Syncing...
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-4 md:pr-6">
          {foundSelectedBoard && (
            <div>
              <button
                data-cy="add-new-task-button"
                onClick={() => {
                  setDashboardState!((old) => ({
                    ...old,
                    showAddNewTaskModal: true,
                  }))
                }}
                disabled={boardColumns!.length === 0 || promiseCounter > 0}
                className="md:hidden bg-blue2 disabled:opacity-30 pl-[18px] pr-[18px] pt-[10px] pb-[10px] rounded-2xl disabled:cursor-not-allowed"
              >
                <IconAddTaskMobile />
              </button>
              <button
                data-cy="add-new-task-button"
                onClick={() => {
                  setDashboardState!((old) => ({
                    ...old,
                    showAddNewTaskModal: true,
                  }))
                }}
                disabled={boardColumns!.length === 0 || promiseCounter > 0}
                className="hidden md:block font-plusJSans text-headingM text-white bg-blue2 hover:bg-blue1 pl-[18px] pr-[18px] pt-[10px] pb-[10px] rounded-2xl disabled:bg-blue1 disabled:cursor-not-allowed"
              >
                + Add New Task
              </button>
            </div>
          )}
          {foundSelectedBoard && (
            <div
              onClick={() => {
                promiseCounter === 0 &&
                  setDashboardState!((prev) => ({
                    ...prev,
                    showBoardMenuModal: true,
                  }))
              }}
              className="flex items-center justify-center md:pl-2 md:pr-2"
            >
              <button
                disabled={promiseCounter > 0}
                data-cy="edit-board-button"
                className="disabled:cursor-not-allowed"
              >
                <IconVerticalEllipsis />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
