import { useQuery } from 'react-query'
import axios from 'axios'
export const useUser = () => {
  const {
    data: user,
    status,
    error,
    refetch,
  } = useQuery(
    'user',
    async () => {
      const data = await axios.get('/api/auth')
      return data.data
    },
    {
      retry: false,
    },
  )

  return {
    refetch,
    user,
    status,
    error,
  }
}
