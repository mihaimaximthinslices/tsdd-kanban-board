import { ReactElement } from 'react'
import { clsx } from 'clsx'

export function Modal({
  children,
  mobileTop,
  onClose,
}: {
  children: ReactElement
  mobileTop: boolean
  onClose: () => void
}) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(0,0,0,0.3)',
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'modal-container') onClose()
      }}
      id="modal-container"
      data-cy="modal-background"
      className={clsx(
        'fixed z-20 left-0 top-0 w-full h-full overflow-auto bg-black1 flex justify-center cursor-pointer',
        mobileTop ? 'items-start pt-20' : 'items-center',
      )}
    >
      <div className="cursor-default">{children}</div>
    </div>
  )
}
