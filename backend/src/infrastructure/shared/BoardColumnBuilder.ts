import { faker } from '@faker-js/faker'
import { BoardColumn } from '../../domain/entities'
export const boardColumnBuilder = {
  build: (partialBoardColumn?: Partial<BoardColumn>) => {
    let newBoardColumn: BoardColumn = {
      id: faker.string.uuid(),
      boardId: faker.string.uuid(),
      columnName: faker.word.noun(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (partialBoardColumn) {
      newBoardColumn = {
        ...newBoardColumn,
        ...partialBoardColumn,
      }
    }
    return newBoardColumn
  },
  buildMany: (count: number, partialBoardColumn?: Partial<BoardColumn>) => {
    const boards: BoardColumn[] = []
    for (let i = 0; i < count; i++) {
      let newBoardColumn: BoardColumn = {
        id: faker.string.uuid(),
        boardId: faker.string.uuid(),
        columnName: faker.word.noun(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      if (partialBoardColumn) {
        newBoardColumn = {
          ...newBoardColumn,
          ...partialBoardColumn,
        }
      }
      boards.push(newBoardColumn)
    }
    return boards
  },
}
