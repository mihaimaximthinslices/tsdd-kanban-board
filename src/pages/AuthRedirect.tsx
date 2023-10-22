import { useUser } from '../hooks/useUser.tsx'
import { useNavigate, useParams } from 'react-router-dom'

export default function AuthRedirect() {
  const { route } = useParams()
  const { refetch } = useUser()
  const navigate = useNavigate()

  refetch().then((data) => {
    const user = data.data?.user
    if (!user) {
      navigate('/sign-in')
    } else {
      if (route === 'dashboard') {
        navigate('/')
      } else {
        navigate('/' + route)
      }
    }
  })
  return <></>
}
