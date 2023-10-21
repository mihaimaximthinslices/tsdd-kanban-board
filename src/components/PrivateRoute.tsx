import { Navigate } from 'react-router-dom'
import { ReactElement } from 'react'
type PropsWithChildren = {
  children: ReactElement
}
export const PrivateRoute = ({ children }: PropsWithChildren) => {
  const user = {
    email: null,
  }
  return <>{user.email ? children : <Navigate to="/sign-in" />}</>
}
