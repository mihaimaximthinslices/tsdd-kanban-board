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
}

export const deleteBoardUsecase: UseCaseConstructor<Params, Request, void> = (request) => {
  const { userRepository, boardRepository, boardColumnRepository } = request

  return async (params) => {
    const { userId, boardId } = params
    await validateUser(userId)
    await validateBoard(userId, boardId)

    const boardColumns = await boardColumnRepository.getByBoardId(boardId)

    const boardColumnsDeletePromise = boardColumns.map(
      (board) =>
        new Promise((resolve) => {
          resolve(boardColumnRepository.delete(board.id))
        }),
    )

    await Promise.all(boardColumnsDeletePromise)

    await boardRepository.delete(boardId)
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
}
