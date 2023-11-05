import { PortalModal } from '../modal/PortalModal.tsx'
import { useContext, useState } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'
import axios from 'axios'
import { useBoardColumns } from '../hooks/useBoardColumns.tsx'
import { LoadingSpinner } from './LoadingSpinner.tsx'
import { useTask } from '../hooks/useTask.tsx'

export function DeleteTaskModal() {
  const {
    setDashboardState,
    selectedTask,
    selectedBoard,
    promiseCounter,
    addToPromiseQueue,
  } = useContext(DashboardContext)
  const { refetch: boardColumnsRefetch } = useBoardColumns(selectedBoard)

  const { task } = useTask(selectedTask!)

  const [requestState, setRequestState] = useState({
    error: false,
    loading: false,
  })

  async function deleteTask() {
    addToPromiseQueue(async () => {
      try {
        setRequestState((prev) => ({ ...prev, loading: true }))

        await axios.delete(`/api/tasks/${selectedTask}`)

        boardColumnsRefetch().then(() => {
          setRequestState((prev) => ({ ...prev, loading: false }))
          setDashboardState!((old) => ({
            ...old,
            showDeleteTaskModal: false,
            selectedTask: null,
          }))
        })
      } catch (err) {
        setRequestState({ loading: false, error: true })
      }
    })
  }

  return (
    <PortalModal
      onClose={() => {
        setDashboardState!((old) => ({ ...old, showDeleteTaskModal: false }))
      }}
    >
      <div className="bg-white dark:bg-black2 rounded-md p-4 md:pb-10 md:pt-8 flex flex-col gap-6 w-[343px] md:w-[480px] shadow-md dark:border border-black1">
        <div>
          <h1 className="font-plusJSans text-red2 text-headingL">
            Delete this task?
          </h1>
        </div>
        <div>
          <p className="font-plusJSans text-bodyM text-white4 break-words">
            Are you sure you want to delete the ‘{task!.title}’ task and its
            subtasks? This action cannot be reversed.
          </p>
        </div>
        <div className="flex flex-col gap-4 items-center justify-center md:flex-row">
          <button
            disabled={
              requestState.loading || requestState.error || promiseCounter > 0
            }
            onClick={() => {
              deleteTask()
            }}
            className="font-plusJSans text-bodyL bg-red2 w-full rounded-2xl pt-2 pb-2 text-white hover:bg-red1 disabled:bg-red1"
          >
            {requestState.loading ? <LoadingSpinner /> : <span>Delete</span>}
          </button>
          <button
            disabled={
              requestState.loading ||
              requestState.error ||
              (requestState.loading && promiseCounter > 0)
            }
            onClick={() => {
              setDashboardState!((old) => ({
                ...old,
                showDeleteTaskModal: false,
                showViewTaskModal: true,
              }))
            }}
            className="font-plusJSans text-bodyL bg-white2 w-full rounded-2xl pt-2 pb-2 text-blue2 hover:bg-white3 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </PortalModal>
  )
}
