import { Board } from '../entities'

export type BoardRepository = {
  getByUserId: (id: string) => Promise<Board[]>
  getByUserIdAndBoardName: (id: string, name: string) => Promise<Board | null>
  getById: (id: string) => Promise<Board | null>
  save: (board: Board) => Promise<void>
  delete: (id: string) => Promise<void>
}
