import { useQuery } from 'react-query'
import axios from 'axios'
import { BoardColumn } from '../../backend/src/domain/entities'

export const useBoardColumns = (boardId: string | null) => {
  const { data: boardColumns, ...options } = useQuery<BoardColumn[], Error>(
    'boardColumns',
    async () => {
      try {
        if (boardId) {
          const data = await axios.get(`/api/boards/${boardId}/columns`)
          return data.data.columns
        }
        return []
      } catch (err) {
        return []
      }
    },
    {
      retry: false,
    },
  )

  return {
    boardColumns,
    ...options,
  }
}
