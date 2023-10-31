import { TaskRepository } from '../repositorties'

export interface Task {
  id: string
  columnId: string
  taskBeforeId: string | null
  taskAfterId: string | null
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export async function orderTasksByLinks(tasks: Task[], taskRepository: TaskRepository) {
  const map: Record<string, Task> = tasks.reduce((acc: Record<string, Task>, task) => {
    acc[task.id] = task
    return acc
  }, {})

  const orderedTasks: Task[] = []
  const visited: Record<string, boolean> = {}

  let currentTask = tasks.find((task) => task.taskBeforeId === null)

  while (currentTask) {
    if (visited[currentTask.id]) {
      const deletePromises = tasks.map((task) => new Promise((resolve) => resolve(taskRepository.delete(task.id))))
      await Promise.all(deletePromises)
      return []
    }

    visited[currentTask.id] = true
    orderedTasks.push(currentTask)

    if (!currentTask.taskAfterId) break

    currentTask = map[currentTask.taskAfterId]
  }

  return orderedTasks
}
