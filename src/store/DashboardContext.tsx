import React, { createContext, useEffect, useState } from 'react'
import { useBoardColumns } from '../hooks/useBoardColumns.tsx'
import usePromiseQueue from '../hooks/usePromiseQueue.tsx'
import { useQueryClient } from 'react-query'

type DashboardStateType = {
  showAddNewBoardModal: boolean
  showEditBoardModal: boolean
  showBoardMenuModal: boolean
  showDeleteBoardModal: boolean
  showDeleteColumnModal: boolean
  showAddNewTaskModal: boolean
  showViewTaskModal: boolean
  showDeleteTaskModal: boolean
  showEditTaskModal: boolean
  selectedBoard: string | null
  selectedTask: string | null
  kanbanBoardItemsHeight: number | null
  loadingColumns: Record<string, boolean>
  setDashboardState?: React.Dispatch<React.SetStateAction<DashboardStateType>>
  addToPromiseQueue: (operation: () => Promise<void>) => Promise<void>
  promiseCounter: number
  isChangingBoard: boolean
}
export const DashboardState = {
  showAddNewBoardModal: false,
  showEditBoardModal: false,
  showBoardMenuModal: false,
  showDeleteBoardModal: false,
  showDeleteColumnModal: false,
  showAddNewTaskModal: false,
  showViewTaskModal: false,
  showEditTaskModal: false,
  showDeleteTaskModal: false,
  kanbanBoardItemsHeight: null,
  selectedBoard: null,
  selectedTask: null,
  isChangingBoard: false,
  loadingColumns: {},
  addToPromiseQueue: () => Promise.resolve(),
  promiseCounter: 0,
}
export const DashboardContext =
  createContext<DashboardStateType>(DashboardState)

export const DashboardContextWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { promiseCounter, addPromise } = usePromiseQueue()

  const [dashboardState, setDashboardState] =
    useState<DashboardStateType>(DashboardState)
  const queryClient = useQueryClient()

  const { refetch: boardColumnsRefetch } = useBoardColumns(
    dashboardState.selectedBoard,
  )
  useEffect(() => {
    queryClient.setQueryData('boardColumns', [])
    setDashboardState((old) => ({
      ...old,
      isChangingBoard: true,
    }))
    boardColumnsRefetch().then(() => {
      setDashboardState((old) => ({
        ...old,
        isChangingBoard: false,
      }))
    })
  }, [dashboardState.selectedBoard])

  return (
    <DashboardContext.Provider
      value={{
        showAddNewBoardModal: dashboardState.showAddNewBoardModal,
        showEditBoardModal: dashboardState.showEditBoardModal,
        showBoardMenuModal: dashboardState.showBoardMenuModal,
        showDeleteBoardModal: dashboardState.showDeleteBoardModal,
        showDeleteColumnModal: dashboardState.showDeleteColumnModal,
        showAddNewTaskModal: dashboardState.showAddNewTaskModal,
        showViewTaskModal: dashboardState.showViewTaskModal,
        showDeleteTaskModal: dashboardState.showDeleteTaskModal,
        kanbanBoardItemsHeight: dashboardState.kanbanBoardItemsHeight,
        selectedBoard: dashboardState.selectedBoard,
        selectedTask: dashboardState.selectedTask,
        isChangingBoard: dashboardState.isChangingBoard,
        showEditTaskModal: dashboardState.showEditTaskModal,
        loadingColumns: dashboardState.loadingColumns,
        addToPromiseQueue: addPromise,
        promiseCounter: promiseCounter,
        setDashboardState,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}
