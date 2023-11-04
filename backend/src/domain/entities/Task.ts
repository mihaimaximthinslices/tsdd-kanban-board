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

export async function resetOrdering(tasks: Task[], taskRepository: TaskRepository) {
  let previous = tasks[0]!
  previous.taskBeforeId = null
  previous.taskAfterId = null

  for (let i = 1; i < tasks.length; i++) {
    const current = tasks[i]!

    current.taskBeforeId = previous.id
    previous.taskAfterId = current.id

    if (i === tasks.length - 1) {
      current.taskAfterId = null
    }
    previous = current
  }

  for (let i = 0; i < tasks.length; i++) {
    await taskRepository.save(tasks[i]!)
  }
}
export async function orderTasksByLinks(tasks: Task[], taskRepository: TaskRepository) {
  const map: Record<string, Task> = tasks.reduce((acc: Record<string, Task>, task) => {
    acc[task.id] = task
    return acc
  }, {})

  const orderedTasks: Task[] = []
  const visited: Record<string, boolean> = {}

  let currentTask = tasks.find((task) => task.taskBeforeId === null)

  if (!currentTask && tasks.length > 0) {
    await resetOrdering(tasks, taskRepository)
    currentTask = tasks.find((task) => task.taskBeforeId === null)
  }

  while (currentTask) {
    if (visited[currentTask.id]) {
      return []
    }

    visited[currentTask.id] = true
    orderedTasks.push(currentTask)

    if (!currentTask.taskAfterId) break

    currentTask = map[currentTask.taskAfterId]
  }

  return orderedTasks
}
