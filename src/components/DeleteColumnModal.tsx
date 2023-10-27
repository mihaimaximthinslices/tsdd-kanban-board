import { PortalModal } from '../modal/PortalModal.tsx'
import { useContext, useState } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'
import { LoadingSpinner } from './LoadingSpinner.tsx'
import { clsx } from 'clsx'
import IconChevronDown from '../svg/icon-chevron-down.tsx'
import { useBoardColumns } from '../hooks/useBoardColumns.tsx'
import axios from 'axios'

export function DeleteColumnModal() {
  const { setDashboardState, selectedBoard } = useContext(DashboardContext)

  const { boardColumns, refetch: boardColumnsRefetch } =
    useBoardColumns(selectedBoard)

  const [showColumOptions, setShowColumnOptions] = useState(false)

  const [selectedOption, setSelectedOption] = useState(boardColumns![0])

  const [requestState, setRequestState] = useState({
    loading: false,
    error: false,
  })

  async function deleteBoardColumn() {
    try {
      setRequestState((prev) => ({ ...prev, loading: true }))

      await axios.delete(
        `/api/boards/${selectedBoard}/columns/${selectedOption.id}`,
      )

      boardColumnsRefetch().then(() => {
        setDashboardState!((old) => ({
          ...old,
          showDeleteColumnModal: false,
        }))
        setRequestState((prev) => ({ ...prev, loading: false }))
      })
    } catch (err) {
      setRequestState({ loading: false, error: true })
    }
  }

  return (
    <PortalModal
      onClose={() => {
        setDashboardState!((old) => ({ ...old, showDeleteColumnModal: false }))
      }}
    >
      <div className="bg-white dark:bg-black2 rounded-md p-4 md:pb-10 md:pt-8 md:pl-8 md:pr-8 flex flex-col gap-6 w-[343px] md:w-[480px] shadow-md dark:border border-black1">
        <div>
          <h1 className="font-plusJSans text-red2 text-headingL">
            Delete this column?
          </h1>
        </div>
        <div className="flex flex-col gap-4">
          <p className="font-plusJSans text-bodyM text-white4 text-justify">
            Select the column you want to delete
          </p>
          <div
            data-cy="link-card-platform"
            onClick={() => setShowColumnOptions((old) => !old)}
            className="flex flex-col w-full gap-1 relative"
          >
            <div
              className={clsx(
                'cursor-pointer absolute right-4 top-[16px]',
                showColumOptions && 'transform: rotate-180',
              )}
            >
              <IconChevronDown />
            </div>
            <button
              data-cy="link-card-platform-viewname"
              className="pt-2 pl-4 pr-4 pb-2 rounded-md border border-blackS bg-no-repeat bg-custom-arrow-up text-left bg-white font-plusJSans text-bodyL dark:bg-black2 dark:border-black1 dark:text-white"
            >
              {selectedOption.columnName}
            </button>
          </div>
          {showColumOptions && (
            <div className="w-full flex flex-col -mt-3">
              {boardColumns!.map((column) => {
                return (
                  <button
                    key={column.id}
                    onClick={() => {
                      setSelectedOption(column)
                    }}
                    className="relative font-plusJSans text-bodyL bg-white2 w-full pt-2 pb-2 pl-4 text-black hover:bg-white3 text-left  flex items-center dark:text-white dark:bg-black1 dark:hover:bg-blue1"
                  >
                    {column.id === selectedOption.id && (
                      <span className="h-[15px] text-center absolute left-[5px] text-blue2">
                        *
                      </span>
                    )}
                    <span>{column.columnName}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 items-center justify-center md:flex-row">
          <button
            onClick={() => {
              setShowColumnOptions(false)
              deleteBoardColumn()
            }}
            data-cy="delete-board-confirmation-button"
            disabled={requestState.loading || requestState.error}
            className="font-plusJSans text-bodyL bg-red2 w-full rounded-2xl pt-2 pb-2 text-white hover:bg-red1"
          >
            {requestState.loading ? <LoadingSpinner /> : <span>Delete</span>}
          </button>
          <button
            data-cy="delete-board-cancel-button"
            onClick={() => {
              setDashboardState!((old) => ({
                ...old,
                showDeleteColumnModal: false,
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
