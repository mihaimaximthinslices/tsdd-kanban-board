import React, { createContext, useEffect, useState } from 'react'
import { useBoards } from '../hooks/useBoards.tsx'
import { useBoardColumns } from '../hooks/useBoardColumns.tsx'
import usePromiseQueue from '../hooks/usePromiseQueue.tsx'

type DashboardStateType = {
  showAddNewBoardModal: boolean
  showEditBoardModal: boolean
  showBoardMenuModal: boolean
  showDeleteBoardModal: boolean
  showDeleteColumnModal: boolean
  showAddNewTaskModal: boolean
  showViewTaskModal: boolean
  selectedBoard: string | null
  selectedTask: string | null
  kanbanBoardItemsHeight: number | null
  setDashboardState?: React.Dispatch<React.SetStateAction<DashboardStateType>>
  addToPromiseQueue: (operation: () => Promise<void>) => Promise<void>
  promiseCounter: number
}
export const DashboardState = {
  showAddNewBoardModal: false,
  showEditBoardModal: false,
  showBoardMenuModal: false,
  showDeleteBoardModal: false,
  showDeleteColumnModal: false,
  showAddNewTaskModal: false,
  showViewTaskModal: false,
  kanbanBoardItemsHeight: null,
  selectedBoard: null,
  selectedTask: null,
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
  const { refetch: boardsRefetch } = useBoards()

  const [dashboardState, setDashboardState] =
    useState<DashboardStateType>(DashboardState)

  const { refetch: boardColumnsRefetch } = useBoardColumns(
    dashboardState.selectedBoard,
  )
  useEffect(() => {
    boardsRefetch().then(() => boardColumnsRefetch())
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
        kanbanBoardItemsHeight: dashboardState.kanbanBoardItemsHeight,
        selectedBoard: dashboardState.selectedBoard,
        selectedTask: dashboardState.selectedTask,
        addToPromiseQueue: addPromise,
        promiseCounter: promiseCounter,
        setDashboardState,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}
