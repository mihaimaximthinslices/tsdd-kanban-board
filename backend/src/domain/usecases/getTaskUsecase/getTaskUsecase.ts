import { BoardColumnRepository, BoardRepository, TaskRepository, UserRepository } from '../../repositorties'
import { UseCaseConstructor } from '../../types/UseCase'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { Task } from '../../entities'

type Params = {
  userRepository: UserRepository
  boardRepository: BoardRepository
  boardColumnRepository: BoardColumnRepository
  taskRepository: TaskRepository
}

type Request = {
  userId: string
  taskId: string
}

export const getTaskUsecase: UseCaseConstructor<Params, Request, Task> = (request) => {
  const { userRepository, boardRepository, boardColumnRepository, taskRepository } = request

  return async (params) => {
    const { userId, taskId } = params

    await validateUser(userId)
    const task = await validateTask(taskId)
    const column = await validateColumn(task.columnId)
    await validateBoard(userId, column.boardId)

    return task
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
  }

  async function validateColumn(columnId: string) {
    const column = await boardColumnRepository.getById(columnId)
    if (!column) {
      throw new EntityNotFoundError(columnId)
    }
    return column
  }

  async function validateTask(taskId: string) {
    const task = await taskRepository.getById(taskId)
    if (!task) {
      throw new EntityNotFoundError(taskId)
    }
    return task
  }
}
