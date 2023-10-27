import { BoardColumnRepository, BoardRepository, UserRepository } from '../../repositorties'
import { UseCaseConstructor } from '../../types/UseCase'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'

type Params = {
  userRepository: UserRepository
  boardRepository: BoardRepository
  boardColumnRepository: BoardColumnRepository
}

type Request = {
  userId: string
  boardId: string
  columnId: string
}

export const deleteBoardColumnUsecase: UseCaseConstructor<Params, Request, void> = (request) => {
  const { userRepository, boardRepository, boardColumnRepository } = request

  return async (params) => {
    const { userId, boardId, columnId } = params
    await validateUser(userId)
    await validateBoard(userId, boardId)
    await validateColumn(boardId, columnId)

    await boardColumnRepository.delete(columnId)
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
      throw new EntityNotFoundError(boardId)
    }

    if (board.userId !== userId) {
      throw new UnauthorizedError(userId, boardId)
    }
    return board
  }

  async function validateColumn(boardId: string, columnId: string) {
    const column = await boardColumnRepository.getById(columnId)
    if (!column) {
      throw new EntityNotFoundError(columnId)
    }
    if (column.boardId !== boardId) {
      throw new UnauthorizedError(boardId, columnId)
    }
  }
}
