import { clsx } from 'clsx'
import IconChevronDown from '../svg/icon-chevron-down.tsx'
import { useContext, useState } from 'react'
import { useBoardColumns } from '../hooks/useBoardColumns.tsx'
import { DashboardContext } from '../store/DashboardContext.tsx'
import axios from 'axios'
import { useQueryClient } from 'react-query'

export default function ColumnDropdown({
  currentColumnId,
}: {
  currentColumnId?: string
}) {
  const { selectedBoard } = useContext(DashboardContext)

  const queryClient = useQueryClient()

  const { addToPromiseQueue, selectedTask } = useContext(DashboardContext)

  const { boardColumns } = useBoardColumns(selectedBoard)

  const initialSelectedColumn =
    (currentColumnId !== undefined &&
      boardColumns!.find((c) => c.id === currentColumnId)) ||
    undefined

  const [selectedColumnOption, setSelectedColumnOption] = useState(
    initialSelectedColumn || boardColumns![0],
  )

  const [showColumOptions, setShowColumnOptions] = useState(false)

  return (
    <>
      <div
        data-cy="link-card-platform"
        onClick={() => {
          setShowColumnOptions((old) => !old)
        }}
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
          {selectedColumnOption.columnName}
        </button>
      </div>
      {showColumOptions && (
        <div className="w-full flex flex-col -mt-[6.px]">
          {boardColumns!.map((column) => {
            return (
              <button
                key={column.id}
                onClick={() => {
                  setSelectedColumnOption(column)
                  setShowColumnOptions(false)
                  addToPromiseQueue(
                    () =>
                      new Promise<void>((resolve, reject) => {
                        axios
                          .patch('/api/boards/grouping', {
                            taskId: selectedTask,
                            to: {
                              columnId: column.id,
                              afterTaskId: null,
                            },
                          })
                          .then(() => {
                            queryClient.invalidateQueries({
                              queryKey: [`task${selectedTask}`],
                            })
                          })
                          .then(() => resolve())
                          .catch((err: unknown) => reject(err))
                      }),
                  )
                }}
                className="relative font-plusJSans text-bodyL bg-white2 w-full pt-2 pb-2 pl-4 text-black hover:bg-white3 text-left  flex items-center dark:text-white dark:bg-black1 dark:hover:bg-blue1"
              >
                {column.id === selectedColumnOption.id && (
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
    </>
  )
}
