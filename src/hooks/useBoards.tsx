import { useQuery } from 'react-query'
import axios from 'axios'
import { Board } from '../../backend/src/domain/entities'
export const useBoards = () => {
  const { data: boards, ...options } = useQuery<Board[], Error>(
    'boards',
    async () => {
      const data = await axios.get('/api/boards')
      return data.data.boards
    },
    {
      retry: false,
    },
  )

  return {
    boards,
    ...options,
  }
}
