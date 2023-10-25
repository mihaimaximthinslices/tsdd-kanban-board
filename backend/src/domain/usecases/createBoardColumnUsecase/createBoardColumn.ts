import { UseCaseConstructor } from '../../types/UseCase'
import { BoardRepository, UserRepository } from '../../repositorties'
import { UuidGenerator } from '../../types/UUIDGenerator'
import { DateGenerator } from '../../types/DateGenerator'
import { DuplicateEntityError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { BoardColumnRepository } from '../../repositorties'
import { BoardColumn } from '../../entities'

type Params = {
  userRepository: UserRepository
  boardRepository: BoardRepository
  boardColumnRepository: BoardColumnRepository
  uuidGenerator: UuidGenerator
  dateGenerator: DateGenerator
}

type Request = {
  userId: string
  boardId: string
  columnName: string
}

export const createBoardColumnUsecase: UseCaseConstructor<Params, Request, BoardColumn> = (params) => {
  const { userRepository, boardRepository, boardColumnRepository, uuidGenerator, dateGenerator } = params

  return async (request) => {
    const { userId, boardId, columnName } = request

    await validateUser(userId)

    await validateBoard(userId, boardId)

    await validateColumnName(boardId, columnName)

    const NOW = dateGenerator.now()

    const newBoardColumn: BoardColumn = {
      id: uuidGenerator.next(),
      boardId,
      columnName,
      createdAt: NOW,
      updatedAt: NOW,
    }

    await boardColumnRepository.save(newBoardColumn)

    return newBoardColumn
  }
  async function validateUser(userId: string) {
    const user = await userRepository.getById(userId)

    if (!user) {
      throw new InvalidInputError(userId)
    }
  }

  async function validateBoard(userId: string, boardId: string) {
    const board = await boardRepository.getById(boardId)

    if (!board) {
      throw new InvalidInputError(boardId)
    }

    if (board.userId !== userId) {
      throw new UnauthorizedError(userId, boardId)
    }
  }

  async function validateColumnName(boardId: string, columnName: string) {
    const boardColumn = await params.boardColumnRepository.getByBoardIdAndColumnName(boardId, columnName)

    if (boardColumn) {
      throw new DuplicateEntityError(columnName)
    }
  }
}
