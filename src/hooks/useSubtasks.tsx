import { useQuery } from 'react-query'
import axios from 'axios'
import { Subtask } from '../../backend/src/domain/entities'

export const useSubtasks = (taskId: string) => {
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
      enabled: false,
    },
  )

  return {
    subtasks,
    ...options,
  }
}
