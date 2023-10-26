import { BoardColumn } from '../entities'

export type BoardColumnRepository = {
  getByBoardId: (id: string) => Promise<BoardColumn[]>
  getByBoardIdAndColumnName: (id: string, name: string) => Promise<BoardColumn | null>
  getById: (id: string) => Promise<BoardColumn | null>
  save: (board: BoardColumn) => Promise<void>
  delete: (id: string) => Promise<void>
}
