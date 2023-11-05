import {
  BoardColumnRepository,
  BoardRepository,
  SubtaskRepository,
  TaskRepository,
  UserRepository,
} from '../../repositorties'
import { UseCaseConstructor } from '../../types/UseCase'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
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
}

export const deleteTaskUsecase: UseCaseConstructor<Params, Request, void> = (request) => {
  const { userRepository, boardRepository, boardColumnRepository, taskRepository, subtaskRepository, dateGenerator } =
    request

  return async (params) => {
    const { userId, taskId } = params

    await validateUser(userId)
    const task = await validateTask(taskId)
    const column = await validateColumn(task.columnId)
    await validateBoard(userId, column.boardId)

    const subtasksDeletePromises = await buildSubtasksDeletePromises(taskId)

    await Promise.all(subtasksDeletePromises)

    const NOW = dateGenerator.now()

    if (task.taskBeforeId) {
      const taskBefore = await taskRepository.getById(task.taskBeforeId)
      if (!taskBefore) {
        throw new EntityNotFoundError(task.taskBeforeId)
      }
      await taskRepository.save({
        ...taskBefore,
        taskAfterId: task.taskAfterId ?? null,
        updatedAt: NOW,
      })
    }

    if (task.taskAfterId) {
      const taskAfterId = await taskRepository.getById(task.taskAfterId)
      if (!taskAfterId) {
        throw new EntityNotFoundError(task.taskAfterId)
      }
      await taskRepository.save({
        ...taskAfterId,
        taskBeforeId: task.taskBeforeId ?? null,
        updatedAt: NOW,
      })
    }

    await taskRepository.delete(taskId)
  }

  async function validateUser(userId: string) {
    const user = await userRepository.getById(userId)

    if (!user) {
      throw new InvalidInputError(userId)
    }
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

  async function buildSubtasksDeletePromises(taskId: string) {
    const subtasks = await subtaskRepository.getByTaskId(taskId)

    return subtasks.map((subtask) => new Promise((resolve) => resolve(subtaskRepository.delete(subtask.id))))
  }
}
