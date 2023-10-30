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
