import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'
import { KanbanTask } from './KanbanBoard.tsx'
import { clsx } from 'clsx'

export function KanbanTaskCard({
  provided,

  task,
}: {
  provided: DraggableProvided
  snapshot?: DraggableStateSnapshot
  task: KanbanTask
}) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={clsx(
        'p-4 min-h-[88px] bg-white black:bg-black2 rounded-md shadow-sm flex flex-col justify-start pt-6 mb-5 dark:bg-black2 dark:text-white',
        // snapshot.isDragging && 'bg-blue1',
      )}
      style={{
        userSelect: 'none',
        ...provided.draggableProps.style,
      }}
    >
      <span className="text-headingM font-plusJSans">{task.content}</span>
    </div>
  )
}
