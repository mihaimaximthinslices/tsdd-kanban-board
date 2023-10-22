import { Navigate } from 'react-router-dom'
import { ReactElement } from 'react'
import { useUser } from '../hooks/useUser.tsx'
type PropsWithChildren = {
  children: ReactElement
}
export const PrivateRoute = ({ children }: PropsWithChildren) => {
  const { user, status, error } = useUser()

  if (error) {
    return (
      <>
        <Navigate to="/sign-in" />
      </>
    )
  }

  return (
    <>{user || status === 'loading' ? children : <Navigate to="/sign-in" />}</>
  )
}
