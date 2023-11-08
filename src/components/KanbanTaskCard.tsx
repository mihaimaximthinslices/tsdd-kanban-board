import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'
import { clsx } from 'clsx'
import { SubtaskStatus, Task } from '../../backend/src/domain/entities'
import { useSubtasks } from '../hooks/useSubtasks.tsx'
import { ViewTaskModal } from './ViewTaskModal.tsx'
import { useContext, useEffect } from 'react'
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
  const { promiseCounter } = useContext(DashboardContext)
  const { subtasks, refetch, isLoading, isRefetching } = useSubtasks(task.id)

  useEffect(() => {
    refetch()
  }, [])
  const { setDashboardState, showViewTaskModal, selectedTask } =
    useContext(DashboardContext)

  const doneSubtasks =
    subtasks &&
    subtasks.filter((subtask) => subtask.status === SubtaskStatus.completed)
      .length

  return (
    <div
      onClick={() => {
        if (!showViewTaskModal && !promiseCounter)
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
      <div className="flex flex-col gap-2 w-full">
        <span className="overflow-y-hidden bg-white dark:bg-black2 text-headingM font-plusJSans break-words ">
          {task.title}
        </span>
        {subtasks && subtasks.length > 0 && (
          <span className="font-plusJSans text-bodyM text-white4">
            {doneSubtasks} of {subtasks.length} subtasks
          </span>
        )}
        {(isLoading || isRefetching) && !(subtasks && subtasks.length > 0) && (
          <div className="w-full">
            <div
              role="status"
              className="w-full animate-pulse flex flex-col gap-2"
            >
              <div className=" bg-gray-200 rounded-full dark:bg-black1 w-full h-4"></div>
            </div>
          </div>
        )}
      </div>
      {showViewTaskModal && task.id === selectedTask && <ViewTaskModal />}
    </div>
  )
}
