import { Link } from 'react-router-dom'

export const SignUpPage = () => {
  return (
    <div className="flex flex-col">
      SignUpPage
      <Link to="/">Dashboard</Link>
      <Link to="/sign-in">Sign In</Link>
    </div>
  )
}
