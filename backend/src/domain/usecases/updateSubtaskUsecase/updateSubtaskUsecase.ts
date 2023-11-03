import {
  BoardColumnRepository,
  BoardRepository,
  SubtaskRepository,
  TaskRepository,
  UserRepository,
} from '../../repositorties'
import { UseCaseConstructor } from '../../types/UseCase'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { SubtaskStatus } from '../../entities'
import { DateGenerator } from '../../types/DateGenerator'

type Params = {
  userRepository: UserRepository
  boardRepository: BoardRepository
  boardColumnRepository: BoardColumnRepository
  taskRepository: TaskRepository
  subtaskRepository: SubtaskRepository
  dateGenerator: DateGenerator
}

type Request = {
  userId: string
  taskId: string
  subtaskId: string
  description: string
  status: SubtaskStatus
}

export const updateSubtaskUsecase: UseCaseConstructor<Params, Request, void> = (request) => {
  const { userRepository, boardRepository, boardColumnRepository, taskRepository, subtaskRepository, dateGenerator } =
    request

  return async (params) => {
    const { userId, taskId, subtaskId, description, status } = params

    await validateUser(userId)
    const subtask = await validateSubtask(subtaskId, taskId)
    const task = await validateTask(taskId)
    const column = await validateColumn(task.columnId)
    await validateBoard(userId, column.boardId)

    const NOW = dateGenerator.now()
    await subtaskRepository.save({
      ...subtask,
      description,
      status,
      updatedAt: NOW,
    })
  }

  async function validateUser(userId: string) {
    const user = await userRepository.getById(userId)

    if (!user) {
      throw new InvalidInputError(userId)
    }
  }

  async function validateSubtask(subtaskId: string, taskId: string) {
    const subtask = await subtaskRepository.getById(subtaskId)
    if (!subtask) {
      throw new EntityNotFoundError(subtaskId)
    }

    if (subtask.taskId !== taskId) {
      throw new UnauthorizedError(subtaskId)
    }

    return subtask
  }
  async function validateTask(taskId: string) {
    const task = await taskRepository.getById(taskId)
    if (!task) {
      throw new EntityNotFoundError(taskId)
    }
    return task
  }
  async function validateColumn(columnId: string) {
    const column = await boardColumnRepository.getById(columnId)
    if (!column) {
      throw new EntityNotFoundError(columnId)
    }
    return column
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
}
