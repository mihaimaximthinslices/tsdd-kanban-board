import { PortalModal } from '../modal/PortalModal.tsx'
import { useContext, useState } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'
import { useBoards } from '../hooks/useBoards.tsx'
import axios from 'axios'
import { useBoardColumns } from '../hooks/useBoardColumns.tsx'
import { LoadingSpinner } from './LoadingSpinner.tsx'

export function DeleteBoardModal() {
  const { setDashboardState, selectedBoard } = useContext(DashboardContext)
  const { boards, refetch: boardsRefetch } = useBoards()
  const { refetch: boardColumnsRefetch } = useBoardColumns(selectedBoard)

  const activeBoard = boards && boards.find((b) => b.id === selectedBoard)

  const [requestState, setRequestState] = useState({
    error: false,
    loading: false,
  })

  async function deleteBoard() {
    try {
      setRequestState((prev) => ({ ...prev, loading: true }))

      await axios.delete(`/api/boards/${selectedBoard}`)

      boardColumnsRefetch().then(() => {
        setDashboardState!((old) => ({
          ...old,
          showDeleteBoardModal: false,
          selectedBoard: null,
        }))
        boardsRefetch().then(() => {
          setRequestState((prev) => ({ ...prev, loading: false }))
        })
      })
    } catch (err) {
      setRequestState({ loading: false, error: true })
    }
  }

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
        <div className="flex flex-col gap-4 items-center justify-center md:flex-row">
          <button
            data-cy="delete-board-confirmation-button"
            disabled={requestState.loading || requestState.error}
            onClick={() => {
              deleteBoard()
            }}
            className="font-plusJSans text-bodyL bg-red2 w-full rounded-2xl pt-2 pb-2 text-white hover:bg-red1"
          >
            {requestState.loading ? <LoadingSpinner /> : <span>Delete</span>}
          </button>
          <button
            disabled={requestState.loading || requestState.error}
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
