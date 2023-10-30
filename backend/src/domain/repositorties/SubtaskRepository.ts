import { Subtask } from '../entities'

export type SubtaskRepository = {
  getById: (id: string) => Promise<Subtask | null>
  getByTaskId: (taskId: string) => Promise<Subtask[]>
  save: (task: Subtask) => Promise<void>
  delete: (id: string) => Promise<void>
}
