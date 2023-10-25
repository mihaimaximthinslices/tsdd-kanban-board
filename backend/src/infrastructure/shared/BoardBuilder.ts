import { faker } from '@faker-js/faker'
import { Board } from '../../domain/entities'
export const boardBuilder = {
  build: (partialBoard?: Partial<Board>) => {
    let newBoard: Board = {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      boardName: faker.word.noun(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (partialBoard) {
      newBoard = {
        ...newBoard,
        ...partialBoard,
      }
    }
    return newBoard
  },
  buildMany: (count: number, partialBoard?: Partial<Board>) => {
    const boards: Board[] = []
    for (let i = 0; i < count; i++) {
      let newBoard: Board = {
        id: faker.string.uuid(),
        userId: faker.string.uuid(),
        boardName: faker.word.noun(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      if (partialBoard) {
        newBoard = {
          ...newBoard,
          ...partialBoard,
        }
      }
      boards.push(newBoard)
    }
    return boards
  },
}
