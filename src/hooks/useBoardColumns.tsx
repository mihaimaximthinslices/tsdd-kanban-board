import { useQuery } from 'react-query'
import axios from 'axios'
import { BoardColumn } from '../../backend/src/domain/entities'
import { useContext } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'

export const useBoardColumns = (boardId: string | null) => {
  const { setDashboardState } = useContext(DashboardContext)
  const { data: boardColumns, ...options } = useQuery<BoardColumn[], Error>(
    'boardColumns',
    async () => {
      if (boardId) {
        const data = await axios.get(`/api/boards/${boardId}/columns`)
        return data.data.columns
      }
      return null
    },
    {
      retry: false,
    },
  )

  if (options.error) {
    setDashboardState!((old) => ({ ...old, selectedBoard: null }))
  }

  return {
    boardColumns,
    ...options,
  }
}
