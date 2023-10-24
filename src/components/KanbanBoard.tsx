import { useState } from 'react'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import KanbanTaskColumnCard from './KanbanTaskColumnCard.tsx'

export type KanbanTask = { id: string; content: string }

export type KanbanTaskColumn = { name: string; items: KanbanTask[] }

export type KanbanTaskBoard = Record<string, KanbanTaskColumn>

const tasks: KanbanTask[] = [
  { id: '1', content: 'First task' },
  { id: '2', content: 'Second task' },
  { id: '3', content: 'Third task' },
  { id: '4', content: 'Fourth task' },
  { id: '5', content: 'Fifth task' },
]

const taskStatus = {
  requested: {
    name: 'Requested',
    items: tasks,
  },
  toDo: {
    name: 'To do',
    items: [],
  },
  inProgress: {
    name: 'In Progress',
    items: [],
  },
  done: {
    name: 'Done',
    items: [],
  },
}

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

function KanbanBoard() {
  const [columns, setColumns] = useState(taskStatus as KanbanTaskBoard)
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Jira Board</h1>
      <div
        style={{ display: 'flex', justifyContent: 'center', height: '100%' }}
      >
        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
        >
          {Object.entries(columns).map(([columnId, column]) => {
            return (
              <KanbanTaskColumnCard
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
