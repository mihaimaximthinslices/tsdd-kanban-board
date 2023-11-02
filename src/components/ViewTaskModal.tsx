import { PortalModal } from '../modal/PortalModal.tsx'
import { useContext } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'
import { useTask } from '../hooks/useTask.tsx'
import { useSubtasks } from '../hooks/useSubtasks.tsx'
import React from 'react'
import { SubtaskStatus } from '../../backend/src/domain/entities'
import ColumnDropdown from './ColumnDropdown.tsx'
import CheckboxSubtask from './CheckboxSubtask.tsx'
import IconVerticalEllipsis from '../svg/icon-vertical-ellipsis.tsx'

function TaskView() {
  const { selectedTask } = useContext(DashboardContext)
  const { task } = useTask(selectedTask!)
  const { subtasks } = useSubtasks(selectedTask!)

  const completedSubtasks = subtasks?.filter(
    (subtask) => subtask.status === SubtaskStatus.completed,
  )
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between">
        <h1 className="font-plusJSans text-headingL text-black dark:text-white">
          {task?.title}
        </h1>
        <button data-cy="edit-board-button">
          <IconVerticalEllipsis />
        </button>
      </div>
      {task?.description && (
        <div>
          <p className="font-plusJSans text-bodyL text-white4">
            {task?.description}
          </p>
        </div>
      )}
      {subtasks && subtasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="font-plusJSans text-bodyM text-white4 dark:text-white">
            Subtasks ({completedSubtasks?.length} of {subtasks?.length})
          </p>
          <div className="flex flex-col gap-2">
            {subtasks?.map((subtask) => {
              return <CheckboxSubtask subtask={subtask} key={subtask.id} />
            })}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <span className="font-plusJSans text-white4 dark:text-white text-bodyM">
          Current Status
        </span>
        <ColumnDropdown />
      </div>
    </div>
  )
}

export function ViewTaskModal() {
  const { setDashboardState } = useContext(DashboardContext)
  return (
    <PortalModal
      onClose={() => {
        setDashboardState!((prev) => ({
          ...prev,
          showViewTaskModal: false,
        }))
      }}
    >
      <div
        style={{
          maxHeight: '90vh',
        }}
        className="z-20 min-w-[343px] md:w-[480px] bg-white dark:bg-black2 rounded-md flex flex-col p-6 gap-6 shadow-md dark:border border-black1 overflow-y-auto"
      >
        <React.Suspense fallback={<div>Loading...</div>}>
          <TaskView />
        </React.Suspense>
      </div>
    </PortalModal>
  )
}
