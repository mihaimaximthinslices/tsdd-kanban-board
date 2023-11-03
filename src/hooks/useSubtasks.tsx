import { useQuery } from 'react-query'
import axios from 'axios'
import { Subtask } from '../../backend/src/domain/entities'
import { useContext } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'

export const useSubtasks = (taskId: string) => {
  const { promiseCounter } = useContext(DashboardContext)

  const { data: subtasks, ...options } = useQuery<Subtask[], Error>(
    `subtasks` + taskId,
    async () => {
      try {
        const data = await axios.get(`/api/tasks/${taskId}/subtasks`)
        return data.data
      } catch (err) {
        return []
      }
    },
    {
      retry: false,
      enabled: promiseCounter === 0,
    },
  )

  return {
    subtasks,
    ...options,
  }
}
