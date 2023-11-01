import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import KanbanTaskColumnCard from './KanbanTaskColumnCard.tsx'
import { Task } from '../../backend/src/domain/entities'
import axios from 'axios'

class PromiseQueue {
  queue: Promise<void | boolean> = Promise.resolve(true)

  add(operation: () => Promise<void>) {
    return new Promise((resolve, reject) => {
      this.queue = this.queue.then(operation).then(resolve).catch(reject)
    })
  }
}

const promiseQueue = new PromiseQueue()

export type KanbanTaskColumn = { id: string; name: string; items: Task[] }

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
    const sourceItem = sourceColumn.items[source.index]

    const destColumn = columns[destination.droppableId]
    let destPreviousItem: string | null = null
    if (destination?.index && destination.index > 0) {
      destPreviousItem = destColumn.items[destination.index - 1].id
    }

    promiseQueue.add(
      () =>
        new Promise((resolve, reject) => {
          setTimeout(
            () =>
              axios
                .patch('/api/boards/grouping', {
                  taskId: sourceItem.id,
                  to: {
                    columnId: destination.droppableId,
                    afterTaskId: destPreviousItem,
                  },
                })
                .then(() => resolve())
                .catch((err) => reject(err)),
            500,
          )
        }),
    )

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

function KanbanBoard({
  taskStatus,
  setTaskStatus,
}: {
  taskStatus: KanbanTaskBoard
  setTaskStatus: React.Dispatch<React.SetStateAction<KanbanTaskBoard>>
}) {
  return (
    <div className="h-full">
      <div className="w-full flex gap-4 h-full">
        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, taskStatus, setTaskStatus)}
        >
          {Object.entries(taskStatus).map(([columnId, column]) => {
            return (
              <KanbanTaskColumnCard
                taskStatus={taskStatus}
                setTaskStatus={setTaskStatus}
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
