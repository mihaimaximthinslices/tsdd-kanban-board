import DashboardNavbar from '../components/DashboardNavbar.tsx'
import { useThemeSelector } from '../useThemeSelector.tsx'
import { DashboardSidebar } from '../components/DashboardSidebar.tsx'
import { useEffect, useState } from 'react'
import useWindowDimensions from '../hooks/useWindowDimensions.tsx'
import { ShowSidebarSticky } from '../components/ShowSidebarSticky.tsx'
import { useContext } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'
import { AddNewBoardModal } from '../components/AddNewBoardModal.tsx'
import { useBoardColumns } from '../hooks/useBoardColumns.tsx'
import KanbanBoard, { KanbanTaskBoard } from '../components/KanbanBoard.tsx'
import { EditBoardModal } from '../components/EditBoardModal.tsx'
import { clsx } from 'clsx'
import { useBoards } from '../hooks/useBoards.tsx'
import { BoardMenuModal } from '../components/BoardMenuModal.tsx'
import { DeleteBoardModal } from '../components/DeleteBoardModal.tsx'
import { DeleteColumnModal } from '../components/DeleteColumnModal.tsx'
import { AddNewTaskModal } from '../components/AddNewTaskModal.tsx'
import { DeleteTaskModal } from '../components/DeleteTaskModal.tsx'

export default function DashboardPage() {
  useThemeSelector()

  const {
    showAddNewBoardModal,
    selectedBoard,
    showEditBoardModal,
    setDashboardState,
    showDeleteBoardModal,
    showBoardMenuModal,
    showDeleteColumnModal,
    showAddNewTaskModal,
    showDeleteTaskModal,
    isChangingBoard,
  } = useContext(DashboardContext)

  const { boards } = useBoards()

  const activeBoard = boards && boards.find((b) => b.id === selectedBoard)

  const [showSidebar, setShowSidebar] = useState(true)

  const { width } = useWindowDimensions()

  const canShowSidebar = width! >= 768
  const [kanbanTaskBoard, setKanbanTaskBoard] = useState<KanbanTaskBoard>({})

  const { boardColumns } = useBoardColumns(selectedBoard!)

  useEffect(() => {
    if (boardColumns) {
      const newKanbanTaskBoard: KanbanTaskBoard = {}
      for (let i = 0; i < boardColumns.length; i++) {
        const column = boardColumns[i]
        newKanbanTaskBoard[column.id] = {
          id: column.id,
          name: column.columnName,
          items: kanbanTaskBoard[column.id]?.items ?? [],
        }
      }

      setKanbanTaskBoard(newKanbanTaskBoard)
    }
  }, [boardColumns])

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
      {!showSidebar && canShowSidebar && (
        <ShowSidebarSticky setShowSidebar={setShowSidebar} />
      )}
      <div className="grow flex bg-white2 dark:bg-black3">
        {showSidebar && <DashboardSidebar setShowSidebar={setShowSidebar} />}
        <div className="flex w-full flex-col grow justify-center items-center relative overflow-auto ">
          <div
            className={clsx(
              'grow p-4 flex flex-col items-center justify-center',
            )}
          >
            {boardColumns && boardColumns.length ? (
              <div
                className={clsx(
                  'absolute left-6 pr-6 top-6 flex items-start gap-4',
                )}
              >
                <KanbanBoard
                  taskStatus={kanbanTaskBoard}
                  setTaskStatus={setKanbanTaskBoard}
                />
              </div>
            ) : (
              activeBoard &&
              boardColumns &&
              boardColumns.length === 0 &&
              !isChangingBoard && (
                <div className="flex flex-col items-center gap-6">
                  <h1 className="font-plusJSans text-headingL text-white4 text-center">
                    This board is empty. Create a new column to get started.
                  </h1>
                  <button
                    onClick={() => {
                      setDashboardState!((prev) => ({
                        ...prev,
                        showEditBoardModal: true,
                      }))
                    }}
                    data-cy="add-new-column-button"
                    className="font-plusJSans text-headingM text-white bg-blue2 pl-[18px] pr-[18px] pt-[10px] pb-[10px] rounded-2xl w-fit text-center hover:bg-blue1"
                  >
                    + Add New Column
                  </button>
                </div>
              )
            )}
            {showAddNewBoardModal && <AddNewBoardModal />}
            {showEditBoardModal && <EditBoardModal />}
            {showBoardMenuModal && <BoardMenuModal />}
            {showDeleteBoardModal && <DeleteBoardModal />}
            {showDeleteColumnModal && <DeleteColumnModal />}
            {showAddNewTaskModal && <AddNewTaskModal />}
            {showDeleteTaskModal && <DeleteTaskModal />}
          </div>
        </div>
      </div>
    </div>
  )
}
