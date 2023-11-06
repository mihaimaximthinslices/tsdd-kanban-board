import { useUser } from '../hooks/useUser.tsx'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

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
        axios
          .patch('/api/boards/populate')
          .then(() => navigate('/'))
          .catch(() => {
            navigate('/')
          })
      } else {
        navigate('/' + route)
      }
    }
  })
  return <></>
}
