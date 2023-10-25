import React, { createContext, useEffect, useState } from 'react'

type DashboardStateType = {
  showAddNewBoardModal: boolean
  selectedBoard: string | null
  setDashboardState?: React.Dispatch<React.SetStateAction<DashboardStateType>>
}
export const DashboardState = {
  showAddNewBoardModal: false,
  selectedBoard: localStorage.getItem('selectedBoard') ?? null,
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

  useEffect(() => {
    if (dashboardState.selectedBoard)
      localStorage.setItem('selectedBoard', dashboardState.selectedBoard)
  }, [dashboardState.selectedBoard])

  return (
    <DashboardContext.Provider
      value={{
        showAddNewBoardModal: dashboardState.showAddNewBoardModal,
        selectedBoard: dashboardState.selectedBoard,
        setDashboardState,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}
