import { PortalModal } from '../modal/PortalModal.tsx'
import React, { useContext, useState } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'
import { useTask } from '../hooks/useTask.tsx'
import { useSubtasks } from '../hooks/useSubtasks.tsx'
import { Subtask, SubtaskStatus } from '../../backend/src/domain/entities'
import ColumnDropdown from './ColumnDropdown.tsx'
import CheckboxSubtask from './CheckboxSubtask.tsx'
import IconVerticalEllipsis from '../svg/icon-vertical-ellipsis.tsx'
import axios from 'axios'

function TaskView() {
  const { addToPromiseQueue, promiseCounter } = useContext(DashboardContext)
  const { selectedTask } = useContext(DashboardContext)
  const { task } = useTask(selectedTask!)
  const { subtasks } = useSubtasks(selectedTask!)

  const [localSubtasks, setLocalSubtasks] = useState(subtasks!)

  const [completedSubtasks, setCompletedSubtasks] = useState(
    localSubtasks?.filter((subtask) => subtask.status === 'completed').length ??
      0,
  )

  const handleSubtaskChange = (
    subtaskId: string,
    description: string,
    status: SubtaskStatus,
  ) => {
    setLocalSubtasks((prev) => {
      const subtask = prev!.find((sub: Subtask) => sub.id === subtaskId)
      if (subtask) {
        subtask.status = status
      }
      return prev
    })

    if (status === SubtaskStatus.in_progress) {
      setCompletedSubtasks((old) => old - 1)
    } else {
      setCompletedSubtasks((old) => old + 1)
    }

    addToPromiseQueue(
      () =>
        new Promise<void>((resolve, reject) => {
          axios
            .patch(`/api/tasks/${task!.id}/subtasks/${subtaskId}`, {
              description,
              status,
            })
            .then(() => resolve())
            .catch((err: unknown) => reject(err))
        }),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between">
        <div>
          <h1 className="font-plusJSans text-headingL text-black dark:text-white">
            {task?.title}
          </h1>
        </div>
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
      {localSubtasks && localSubtasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="font-plusJSans text-bodyM text-white4 dark:text-white">
            Subtasks ({completedSubtasks} of {localSubtasks!.length})
          </p>
          <div className="flex flex-col gap-2">
            {localSubtasks?.map((subtask) => {
              return (
                <CheckboxSubtask
                  subtask={subtask}
                  key={subtask.id}
                  handleStatusChange={handleSubtaskChange}
                />
              )
            })}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <span className="font-plusJSans text-white4 dark:text-white text-bodyM">
          Current Status
        </span>
        <ColumnDropdown currentColumnId={task!.columnId} taskId={task!.id} />
      </div>
      <div>
        {promiseCounter > 0 && (
          <div className="flex w-full justify-end relative">
            <div className="flex items-center justify-center space-x-1 animate-pulse absolute top-[-10px]">
              <span className="font-plusJSans text-bodyM text-blue2">
                Syncing...
              </span>
            </div>
          </div>
        )}
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
