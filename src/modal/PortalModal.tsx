import ReactDOM from 'react-dom'
import React from 'react'

export function PortalModal({
  onClose,
  children,
}: {
  onClose: () => void
  children: React.ReactNode
}) {
  return ReactDOM.createPortal(
    <div
      style={{
        backgroundColor: 'rgba(0,0,0,0.3)',
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'portal-modal-container') onClose()
      }}
      id="portal-modal-container"
      className="fixed z-20 left-0 top-0 w-full h-full overflow-auto bg-black1 flex items-center justify-center cursor-pointer"
    >
      <div className="cursor-default">{children}</div>
    </div>,
    document.getElementById('modal-root')!,
  )
}
