import { PortalModal } from '../modal/PortalModal.tsx'
import { useContext } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'

export function ViewTaskModal() {
  const { setDashboardState, selectedTask } = useContext(DashboardContext)

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
        {selectedTask}
      </div>
    </PortalModal>
  )
}
