import { BoardColumnRepository } from '../../domain/repositorties'
import { PrismaClient, BoardColumn as PrismaBoardColumn, BoardColumn } from '@prisma/client'
const prisma = new PrismaClient()

export const prismaBoardColumnRepository: BoardColumnRepository = {
  async delete(id: string): Promise<void> {
    await prisma.board.delete({
      where: { id },
    })
  },
  async getById(id: string): Promise<BoardColumn | null> {
    const boardColumn = await prisma.boardColumn.findFirst({
      where: { id },
    })

    if (!boardColumn) {
      return null
    }

    return rowToEntity(boardColumn)
  },

  async getByBoardId(id: string): Promise<BoardColumn[]> {
    const boardColumns = await prisma.boardColumn.findMany({
      where: { boardId: id },
    })

    return boardColumns.map((row) => rowToEntity(row)) as BoardColumn[]
  },
  async getByBoardIdAndColumnName(id: string, name: string): Promise<BoardColumn | null> {
    const boardColumn = await prisma.boardColumn.findFirst({
      where: { boardId: id, columnName: name },
    })

    if (!boardColumn) {
      return null
    }

    return rowToEntity(boardColumn)
  },

  async save(boardColumn: BoardColumn): Promise<void> {
    const { id, ...boardColumnData } = entityToRow(boardColumn)

    // Use upsert to insert or update the user based on their ID
    await prisma.boardColumn.upsert({
      where: { id },
      update: boardColumnData,
      create: {
        id,
        ...boardColumnData,
      },
    })
  },
}

const rowToEntity = (row: PrismaBoardColumn): BoardColumn => {
  const { id, boardId, columnName, createdAt, updatedAt } = row
  return {
    id,
    boardId,
    columnName,
    createdAt,
    updatedAt,
  }
}

const entityToRow = (entity: BoardColumn): PrismaBoardColumn => {
  const { id, boardId, columnName, createdAt, updatedAt } = entity
  return {
    id,
    boardId,
    columnName,
    createdAt,
    updatedAt,
  }
}
