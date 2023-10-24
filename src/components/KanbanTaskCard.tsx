import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'
import { KanbanTask } from './KanbanBoard.tsx'

export function KanbanTaskCard({
  provided,
  snapshot,
  task,
}: {
  provided: DraggableProvided
  snapshot: DraggableStateSnapshot
  task: KanbanTask
}) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        userSelect: 'none',
        padding: 16,
        margin: '0 0 8px 0',
        minHeight: '50px',
        backgroundColor: snapshot.isDragging ? '#263B4A' : '#456C86',
        color: 'white',
        ...provided.draggableProps.style,
      }}
    >
      {task.content}
    </div>
  )
}
