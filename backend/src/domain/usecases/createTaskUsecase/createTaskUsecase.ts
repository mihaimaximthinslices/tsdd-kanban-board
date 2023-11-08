import { UseCaseConstructor } from '../../types/UseCase'
import {
  BoardColumnRepository,
  BoardRepository,
  SubtaskRepository,
  TaskRepository,
  UserRepository,
} from '../../repositorties'
import { UuidGenerator } from '../../types/UUIDGenerator'
import { DateGenerator } from '../../types/DateGenerator'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { SubtaskStatus } from '../../entities'

type Params = {
  userRepository: UserRepository
  boardRepository: BoardRepository
  boardColumnRepository: BoardColumnRepository
  taskRepository: TaskRepository
  subtaskRepository: SubtaskRepository
  uuidGenerator: UuidGenerator
  dateGenerator: DateGenerator
}

type Request = {
  userId: string
  columnId: string
  title: string
  description: string
  subtasks: string[]
}

export const createTaskUsecase: UseCaseConstructor<Params, Request, void> = (params) => {
  const {
    userRepository,
    boardColumnRepository,
    boardRepository,
    taskRepository,
    subtaskRepository,
    uuidGenerator,
    dateGenerator,
  } = params
  return async (request) => {
    const { userId, columnId, title, description, subtasks } = request
    await validateUser(userId)
    await validateColumn(columnId, userId)

    const lastColumnTask = await getLastTaskFromColumn(columnId)

    const NOW = dateGenerator.now()

    const newTaskId = uuidGenerator.next()

    const subtaskCreatePromises = await makeSubtaskCreatePromises(subtasks, newTaskId)

    if (!lastColumnTask) {
      await taskRepository.save({
        id: newTaskId,
        taskBeforeId: null,
        taskAfterId: null,
        columnId: columnId,
        title,
        description,
        createdAt: NOW,
        updatedAt: NOW,
      })
      await Promise.all(subtaskCreatePromises)
      return
    }

    await taskRepository.save({
      id: newTaskId,
      taskBeforeId: lastColumnTask.id,
      taskAfterId: null,
      columnId: columnId,
      title,
      description,
      createdAt: NOW,
      updatedAt: NOW,
    })

    await Promise.all(subtaskCreatePromises)

    await taskRepository.save({
      ...lastColumnTask,
      taskAfterId: newTaskId,
      updatedAt: NOW,
    })
  }

  async function validateUser(userId: string) {
    const user = await userRepository.getById(userId)
    if (!user) {
      throw new InvalidInputError(userId)
    }
  }

  async function validateColumn(columnId: string, userId: string) {
    const column = await boardColumnRepository.getById(columnId)

    if (!column) {
      throw new EntityNotFoundError(columnId)
    }

    const board = await boardRepository.getById(column.boardId)

    if (!board) {
      throw new EntityNotFoundError(column.boardId)
    }

    if (board.userId !== userId) {
      throw new UnauthorizedError(column.id)
    }
  }

  async function getLastTaskFromColumn(columnId: string) {
    const columns = await taskRepository.getByColumnId(columnId)

    return columns.find((column) => column.taskAfterId === null)
  }

  async function makeSubtaskCreatePromises(subtasks: string[], taskId: string) {
    return subtasks.map((subtask, index) => {
      const newSubtaskId = uuidGenerator.next()
      const NOW = dateGenerator.now()
      NOW.setSeconds(NOW.getSeconds() + index)
      return new Promise((resolve) => {
        resolve(
          subtaskRepository.save({
            id: newSubtaskId,
            taskId,
            description: subtask,
            status: SubtaskStatus.in_progress,
            createdAt: NOW,
            updatedAt: NOW,
          }),
        )
      })
    })
  }
}
