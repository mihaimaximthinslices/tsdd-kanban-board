import { Task } from '../entities'

export type TaskRepository = {
  getById: (id: string) => Promise<Task | null>
  getByColumnId: (columnId: string) => Promise<Task[]>
  save: (task: Task) => Promise<void>
  delete: (id: string) => Promise<void>
}
