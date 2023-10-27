import React, { createContext, useEffect, useState } from 'react'
import { useBoards } from '../hooks/useBoards.tsx'
type DashboardStateType = {
  showAddNewBoardModal: boolean
  showEditBoardModal: boolean
  showBoardMenuModal: boolean
  showDeleteBoardModal: boolean
  selectedBoard: string | null
  setDashboardState?: React.Dispatch<React.SetStateAction<DashboardStateType>>
}
export const DashboardState = {
  showAddNewBoardModal: false,
  showEditBoardModal: false,
  showBoardMenuModal: false,
  showDeleteBoardModal: false,
  selectedBoard: null,
}
export const DashboardContext =
  createContext<DashboardStateType>(DashboardState)

export const DashboardContextWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { refetch } = useBoards()
  const [dashboardState, setDashboardState] =
    useState<DashboardStateType>(DashboardState)

  useEffect(() => {
    refetch()
  }, [dashboardState.selectedBoard])

  return (
    <DashboardContext.Provider
      value={{
        showAddNewBoardModal: dashboardState.showAddNewBoardModal,
        showEditBoardModal: dashboardState.showEditBoardModal,
        showBoardMenuModal: dashboardState.showBoardMenuModal,
        showDeleteBoardModal: dashboardState.showDeleteBoardModal,
        selectedBoard: dashboardState.selectedBoard,
        setDashboardState,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}
