import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'
import { clsx } from 'clsx'
import { SubtaskStatus, Task } from '../../backend/src/domain/entities'
import { useSubtasks } from '../hooks/useSubtasks.tsx'
import { ViewTaskModal } from './ViewTaskModal.tsx'
import { useContext } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'

export function KanbanTaskCard({
  provided,
  task,
}: {
  provided: DraggableProvided
  snapshot?: DraggableStateSnapshot
  task: Task
  columnId: string
}) {
  const { subtasks } = useSubtasks(task.id)

  const { setDashboardState, showViewTaskModal } = useContext(DashboardContext)

  const doneSubtasks =
    subtasks &&
    subtasks.filter((subtask) => subtask.status === SubtaskStatus.completed)
      .length

  return (
    <div
      onClick={() => {
        if (!showViewTaskModal)
          setDashboardState!((old) => ({
            ...old,
            showViewTaskModal: true,
            selectedTask: task.id,
          }))
      }}
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
      <div className="flex flex-col gap-2">
        <span className="text-headingM font-plusJSans">{task.title}</span>
        {subtasks && subtasks.length > 0 && (
          <span className="text-bodyM text-white4">
            {doneSubtasks} of {subtasks.length} subtasks
          </span>
        )}
      </div>
      {showViewTaskModal && <ViewTaskModal />}
    </div>
  )
}
