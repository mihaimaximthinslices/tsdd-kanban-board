import React, { createContext, useState } from 'react'

type DashboardStateType = {
  showAddNewBoardModal: boolean
  setDashboardState?: React.Dispatch<React.SetStateAction<DashboardStateType>>
}
export const DashboardState = {
  showAddNewBoardModal: false,
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
        setDashboardState,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}
