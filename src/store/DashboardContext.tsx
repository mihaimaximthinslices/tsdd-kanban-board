import React, { createContext, useState } from 'react'

type DashboardStateType = {
  showAddNewBoardModal: boolean
  showEditBoardModal: boolean
  showBoardMenuModal: boolean
  selectedBoard: string | null
  setDashboardState?: React.Dispatch<React.SetStateAction<DashboardStateType>>
}
export const DashboardState = {
  showAddNewBoardModal: false,
  showEditBoardModal: false,
  showBoardMenuModal: false,
  selectedBoard: null,
}
export const DashboardContext =
  createContext<DashboardStateType>(DashboardState)

export const DashboardContextWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [dashboardState, setDashboardState] =
    useState<DashboardStateType>(DashboardState)

  return (
    <DashboardContext.Provider
      value={{
        showAddNewBoardModal: dashboardState.showAddNewBoardModal,
        showEditBoardModal: dashboardState.showEditBoardModal,
        showBoardMenuModal: dashboardState.showBoardMenuModal,
        selectedBoard: dashboardState.selectedBoard,
        setDashboardState,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}
