import { useQuery } from 'react-query'
import axios from 'axios'
import { BoardColumn } from '../../backend/src/domain/entities'
import { useContext } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'

export const useBoardColumns = (boardId: string | null) => {
  const { selectedBoard } = useContext(DashboardContext)
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
      enabled: selectedBoard !== null,
    },
  )

  return {
    boardColumns,
    ...options,
  }
}
