import { Draggable, Droppable } from 'react-beautiful-dnd'
import { KanbanTaskCard } from './KanbanTaskCard.tsx'
import { KanbanTaskBoard, KanbanTaskColumn } from './KanbanBoard.tsx'
import useWindowDimensions from '../hooks/useWindowDimensions.tsx'
import { clsx } from 'clsx'
import { Task } from '../../backend/src/domain/entities'
import { useColumnTasks } from '../hooks/useColumnTasks.tsx'
import React, { useContext, useEffect } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'
import { useBoardColumns } from '../hooks/useBoardColumns.tsx'
import { KanbanTaskCardSkeleton } from './KanbanTaskCardSkeleton.tsx'

export default function KanbanTaskColumnCard({
  taskStatus,
  setTaskStatus,
  column,
  columnId,
}: {
  taskStatus: KanbanTaskBoard
  setTaskStatus: React.Dispatch<React.SetStateAction<KanbanTaskBoard>>
  columnId: string
  column: KanbanTaskColumn
}) {
  const { height } = useWindowDimensions()

  const { selectedBoard } = useContext(DashboardContext)

  const { isRefetching } = useBoardColumns(selectedBoard!)
  const {
    columnTasks,
    refetch: columnTasksRefetch,
    isLoading: columnTasksLoad,
    isRefetching: columnsTasksRefetching,
  } = useColumnTasks(selectedBoard!, columnId)

  const showColumnSkeleton =
    columnTasksLoad ||
    (columnTasks && columnTasks!.length === 0 && columnsTasksRefetching)

  useEffect(() => {
    columnTasksRefetch()
  }, [isRefetching])

  useEffect(() => {
    if (columnTasks) {
      setTaskStatus((prev) => ({
        ...prev,
        [columnId]: {
          id: column.id,
          name: column.name,
          items: columnTasks!,
        },
      }))
    }
  }, [columnTasks])

  return (
    <div
      style={{
        minHeight: height! - 120,
      }}
      className="flex flex-col items-center gap-4"
      key={columnId}
    >
      <div className="flex justify-between w-full">
        <h2 className="font-plusJSans text-white4 tracking-headingS text-headingS w-full text-left cursor-default">
          {!isRefetching ? (
            `${column.name} (` + taskStatus[columnId].items.length + ')'
          ) : (
            <div
              role="status"
              className="w-full animate-pulse flex flex-col gap-2"
            >
              <div className=" bg-white shadow-sm rounded-full dark:bg-black1 w-24 h-4"></div>
            </div>
          )}
        </h2>
      </div>
      <div className="w-[280px] grow pb-6">
        {!showColumnSkeleton ? (
          <Droppable droppableId={columnId} key={columnId}>
            {(provided, snapshot) => {
              return (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={clsx(
                    'w-full h-full flex flex-col grow',
                    snapshot.isDraggingOver && '',
                  )}
                >
                  {column.items.map((item: Task, index: number) => {
                    return (
                      <Draggable
                        // isDragDisabled={promiseCounter !== 0}
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => {
                          return (
                            <KanbanTaskCard
                              columnId={columnId}
                              provided={provided}
                              snapshot={snapshot}
                              task={item}
                            ></KanbanTaskCard>
                          )
                        }}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )
            }}
          </Droppable>
        ) : (
          Array.from([1]).map((key) => {
            return <KanbanTaskCardSkeleton key={key} />
          })
        )}
      </div>
    </div>
  )
}
