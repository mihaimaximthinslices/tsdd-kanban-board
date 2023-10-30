export enum SubtaskStatus {
  in_progress = 'in_progress',
  completed = 'completed',
}

export interface Subtask {
  id: string
  taskId: string
  description: string
  status: SubtaskStatus
  createdAt: Date
  updatedAt: Date
}
