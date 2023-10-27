import { PortalModal } from '../modal/PortalModal.tsx'
import { useContext } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'

export function BoardMenuModal() {
  const { setDashboardState } = useContext(DashboardContext)
  return (
    <PortalModal
      position={'flex justify-end items-start pt-14 bg-opacity-0'}
      onClose={() =>
        setDashboardState!((old) => ({
          ...old,
          showBoardMenuModal: false,
        }))
      }
    >
      <div
        data-cy="board-menu-modal"
        className="bg-white dark:bg-black2 p-4  w-[192px] mr-1 md:mt-5 md:mr-4 rounded-md opacity-100 flex flex-col gap-4 justify-center items-start"
      >
        <button
          data-cy="board-menu-edit-button"
          onClick={() => {
            setDashboardState!((old) => ({
              ...old,
              showBoardMenuModal: false,
              showEditBoardModal: true,
            }))
          }}
          className="font-plusJSans text-bodyL text-white4 hover:underline"
        >
          Edit Board
        </button>
        <button
          data-cy="board-menu-delete-button"
          onClick={() => {
            setDashboardState!((old) => ({
              ...old,
              showBoardMenuModal: false,
              showDeleteBoardModal: true,
            }))
          }}
          className="font-plusJSans text-bodyL text-red2 hover:underline"
        >
          Delete Board
        </button>
      </div>
    </PortalModal>
  )
}
