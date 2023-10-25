import { UseCaseConstructor } from '../../types/UseCase'
import { BoardRepository, UserRepository } from '../../repositorties'
import { DuplicateEntityError, InvalidInputError } from '../../types/Errors'
import { UuidGenerator } from '../../types/UUIDGenerator'
import { DateGenerator } from '../../types/DateGenerator'
import { Board } from '../../entities'

type Params = {
  userRepository: UserRepository
  boardRepository: BoardRepository
  uuidGenerator: UuidGenerator
  dateGenerator: DateGenerator
}

type Request = {
  userId: string
  boardName: string
}

export const createBoardUsecase: UseCaseConstructor<Params, Request, Board> = (params) => {
  const { userRepository, boardRepository, dateGenerator, uuidGenerator } = params
  return async (request) => {
    const { userId, boardName } = request

    await validateUser(userId)

    await validateBoardName(userId, boardName)

    const NOW = dateGenerator.now()

    const newBoard: Board = { id: uuidGenerator.next(), userId, boardName: boardName, createdAt: NOW, updatedAt: NOW }

    await boardRepository.save(newBoard)

    return newBoard
  }

  async function validateUser(userId: string) {
    const user = await userRepository.getById(userId)

    if (!user) {
      throw new InvalidInputError(userId)
    }
  }

  async function validateBoardName(userId: string, name: string) {
    const board = await boardRepository.getByUserIdAndBoardName(userId, name)
    if (board) {
      throw new DuplicateEntityError(name)
    }
  }
}
