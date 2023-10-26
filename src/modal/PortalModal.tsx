import ReactDOM from 'react-dom'
import React from 'react'
import { clsx } from 'clsx'

export function PortalModal({
  onClose,
  children,
  position = null,
}: {
  onClose: () => void
  children: React.ReactNode
  position?: string | null
}) {
  return ReactDOM.createPortal(
    <div
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'portal-modal-container') onClose()
      }}
      id="portal-modal-container"
      className={clsx(
        'fixed z-20 left-0 top-0 w-full h-full overflow-auto bg-black1 cursor-pointer',
        position ? position : 'flex items-center justify-center bg-opacity-30',
      )}
    >
      <div className="cursor-default">{children}</div>
    </div>,
    document.getElementById('modal-root')!,
  )
}
