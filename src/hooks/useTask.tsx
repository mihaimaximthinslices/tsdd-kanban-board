import { useQuery } from 'react-query'
import axios from 'axios'
import { Task } from '../../backend/src/domain/entities'
import { useContext } from 'react'
import { DashboardContext } from '../store/DashboardContext.tsx'

export const useTask = (taskId: string) => {
  const { promiseCounter } = useContext(DashboardContext)

  const { data: task, ...options } = useQuery<Task, Error>(
    `task` + taskId,
    async () => {
      try {
        const data = await axios.get(`/api/tasks/${taskId}`)
        return data.data
      } catch (err) {
        return null
      }
    },
    {
      retry: false,
      suspense: true,
    },
  )

  return {
    task,
    ...options,
    enable: promiseCounter === 0,
  }
}
