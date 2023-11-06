export type ImportedSubtask = {
  title: string
  isCompleted: boolean
}
export type ImportedTask = {
  title: string
  description: string
  status: 'Todo'
  subtasks: ImportedSubtask[]
}
export type ImportedColumn = {
  name: string
  tasks: ImportedTask[]
}
export type ImportedBoard = {
  name: string
  columns: ImportedColumn[]
}
export type ImportedBoards = {
  boards: ImportedBoard[]
}
