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

export function orderTasksByLinks(tasks: Task[]) {
  const map = tasks.reduce((acc: Record<string, Task>, task) => {
    acc[task.id] = task
    return acc
  }, {})

  const orderedTasks = []

  let currentTask = tasks.find((task) => task.taskBeforeId === null)

  while (currentTask) {
    orderedTasks.push(currentTask)
    if (!currentTask.taskAfterId) break
    currentTask = map[currentTask.taskAfterId]
  }

  return orderedTasks
}
