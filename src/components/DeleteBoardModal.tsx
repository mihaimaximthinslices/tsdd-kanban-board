import { PortalModal } from '../modal/PortalModal.tsx'
import { useContext } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'
import { useBoards } from '../hooks/useBoards.tsx'

export function DeleteBoardModal() {
  const { setDashboardState, selectedBoard } = useContext(DashboardContext)
  const { boards } = useBoards()
  const activeBoard = boards && boards.find((b) => b.id === selectedBoard)

  return (
    <PortalModal
      onClose={() => {
        setDashboardState!((old) => ({ ...old, showDeleteBoardModal: false }))
      }}
    >
      <div className="bg-white dark:bg-black2 rounded-md p-4 md:pb-10 md:pt-8 flex flex-col gap-6 w-[343px] md:w-[480px] shadow-md dark:border border-black1">
        <div>
          <h1 className="font-plusJSans text-red2 text-headingL">
            Delete this board?
          </h1>
        </div>
        <div>
          <p className="font-plusJSans text-bodyM text-white4 text-justify">
            Are you sure you want to delete the ‘{activeBoard!.boardName}’
            board? This action will remove all columns and tasks and cannot be
            reversed.
          </p>
        </div>
        <div
          data-cy="delete-board-confirmation-button"
          className="flex flex-col gap-4 items-center justify-center md:flex-row"
        >
          <button className="font-plusJSans text-bodyL bg-red2 w-full rounded-2xl pt-2 pb-2 text-white hover:bg-red1">
            Delete
          </button>
          <button
            data-cy="delete-board-cancel-button"
            onClick={() => {
              setDashboardState!((old) => ({
                ...old,
                showDeleteBoardModal: false,
              }))
            }}
            className="font-plusJSans text-bodyL bg-white2 w-full rounded-2xl pt-2 pb-2 text-blue2 hover:bg-white3"
          >
            Cancel
          </button>
        </div>
      </div>
    </PortalModal>
  )
}
