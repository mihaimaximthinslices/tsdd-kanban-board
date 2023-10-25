import { BoardRepository } from '../../domain/repositorties'
import { PrismaClient, Board as PrismaBoard } from '@prisma/client'
import { Board } from '../../domain/entities'
const prisma = new PrismaClient()

export const prismaBoardRepository: BoardRepository = {
  async delete(id: string): Promise<void> {
    await prisma.board.delete({
      where: { id },
    })
  },
  async getById(id: string): Promise<Board | null> {
    const board = await prisma.board.findFirst({
      where: { id },
    })

    if (!board) {
      return null
    }

    return rowToEntity(board)
  },

  async getByUserId(id: string): Promise<Board[]> {
    const boards = await prisma.board.findMany({
      where: { userId: id },
    })

    return boards.map((row) => rowToEntity(row)) as Board[]
  },
  async getByUserIdAndBoardName(id: string, name: string): Promise<Board | null> {
    const board = await prisma.board.findFirst({
      where: { userId: id, boardName: name },
    })

    if (!board) {
      return null
    }

    return rowToEntity(board)
  },
  async save(board: Board): Promise<void> {
    const { id, ...boardData } = entityToRow(board)

    // Use upsert to insert or update the user based on their ID
    await prisma.board.upsert({
      where: { id },
      update: boardData,
      create: {
        id,
        ...boardData,
      },
    })
  },
}

const rowToEntity = (row: PrismaBoard): Board => {
  const { id, userId, boardName, createdAt, updatedAt } = row
  return {
    id,
    userId,
    boardName,
    createdAt,
    updatedAt,
  }
}

const entityToRow = (entity: Board): PrismaBoard => {
  const { id, userId, boardName, createdAt, updatedAt } = entity
  return {
    id,
    userId,
    boardName,
    createdAt,
    updatedAt,
  }
}
