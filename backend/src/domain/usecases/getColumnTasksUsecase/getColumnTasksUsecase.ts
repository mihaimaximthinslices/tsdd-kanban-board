import { BoardColumnRepository, BoardRepository, TaskRepository, UserRepository } from '../../repositorties'
import { UseCaseConstructor } from '../../types/UseCase'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { Task, orderTasksByLinks } from '../../entities'

type Params = {
  userRepository: UserRepository
  boardRepository: BoardRepository
  boardColumnRepository: BoardColumnRepository
  taskRepository: TaskRepository
}

type Request = {
  userId: string
  boardId: string
  columnId: string
}

export const getColumnTasksUsecase: UseCaseConstructor<Params, Request, Task[]> = (request) => {
  const { userRepository, boardRepository, boardColumnRepository, taskRepository } = request

  return async (params) => {
    const { userId, boardId, columnId } = params

    await validateUser(userId)
    await validateBoard(userId, boardId)
    await validateColumn(boardId, columnId)

    const tasks = await taskRepository.getByColumnId(columnId)
    return orderTasksByLinks(tasks, taskRepository)
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
