import { useEffect, useState } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import KanbanTaskColumnCard from './KanbanTaskColumnCard.tsx'

export type KanbanTask = { id: string; content: string }

export type KanbanTaskColumn = { name: string; items: KanbanTask[] }

export type KanbanTaskBoard = Record<string, KanbanTaskColumn>

const onDragEnd = (
  result: DropResult,
  columns: KanbanTaskBoard,
  setColumns: React.Dispatch<React.SetStateAction<KanbanTaskBoard>>,
) => {
  if (!result.destination) return
  const { source, destination } = result

  if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId]
    const destColumn = columns[destination.droppableId]
    const sourceItems = [...sourceColumn.items]
    const destItems = [...destColumn.items]
    const [removed] = sourceItems.splice(source.index, 1)
    destItems.splice(destination.index, 0, removed)
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    })
  } else {
    const column = columns[source.droppableId]
    const copiedItems = [...column.items]
    const [removed] = copiedItems.splice(source.index, 1)
    copiedItems.splice(destination.index, 0, removed)
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copiedItems,
      },
    })
  }
}

function KanbanBoard({ taskStatus }: { taskStatus: KanbanTaskBoard }) {
  useEffect(() => {
    setColumns(taskStatus)
  }, [taskStatus])
  const [columns, setColumns] = useState(taskStatus as KanbanTaskBoard)
  return (
    <div>
      <div
        style={{ display: 'flex', justifyContent: 'center', height: '100%' }}
      >
        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
        >
          {Object.entries(columns).map(([columnId, column]) => {
            return (
              <KanbanTaskColumnCard
                key={columnId}
                columnId={columnId}
                column={column}
              ></KanbanTaskColumnCard>
            )
          })}
        </DragDropContext>
      </div>
    </div>
  )
}

export default KanbanBoard
