import { UseCaseConstructor } from '../../types/UseCase'
import {
  BoardColumnRepository,
  BoardRepository,
  SubtaskRepository,
  TaskRepository,
  UserRepository,
} from '../../repositorties'
import { DateGenerator } from '../../types/DateGenerator'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { Subtask, SubtaskStatus } from '../../entities'
import { UuidGenerator } from '../../types/UUIDGenerator'

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
  taskId: string
  columnId: string
  taskTitle: string
  taskDescription: string
  subtasks: string[]
  subtasksIds: string[]
}

export const updateTaskUsecase: UseCaseConstructor<Params, Request, void> = (params) => {
  const {
    userRepository,
    taskRepository,
    boardColumnRepository,
    boardRepository,
    subtaskRepository,
    uuidGenerator,
    dateGenerator,
  } = params
  return async (request) => {
    const { userId, taskId, subtasksIds, subtasks, taskTitle, taskDescription, columnId } = request
    await validateUser(userId)
    const task = await validateTask(taskId)
    const column = await validateColumn(task.columnId, columnId)

    await validateBoard(userId, column.boardId)

    const alreadyExistingSubtasks = await subtaskRepository.getByTaskId(taskId)

    const [deletePromises, updatePromises, insertPromises] = await prepareSubtasksPromises(
      alreadyExistingSubtasks,
      subtasksIds,
      subtasks,
      taskId,
    )

    const NOW = dateGenerator.now()

    await Promise.all([
      ...deletePromises!,
      ...updatePromises!,
      ...insertPromises!,
      new Promise((resolve) => {
        resolve(
          taskRepository.save({
            ...task,
            updatedAt: NOW,
            columnId,
            title: taskTitle,
            description: taskDescription,
          }),
        )
      }),
    ])
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

  async function validateColumn(columnId: string, targetColumnId: string) {
    const column = await boardColumnRepository.getById(columnId)
    if (!column) {
      throw new EntityNotFoundError(columnId)
    }
    if (targetColumnId === columnId) return column

    const targetColumn = await boardColumnRepository.getById(targetColumnId)
    if (!targetColumn) {
      throw new EntityNotFoundError(targetColumnId)
    }

    if (targetColumn.boardId !== column.boardId) {
      throw new UnauthorizedError(targetColumn.id)
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

  async function prepareSubtasksPromises(
    subtasks: Subtask[],
    subtasksIds: string[],
    subtasksDescriptions: string[],
    taskId: string,
  ) {
    const updatedDescriptionsDict: Record<string, string> = {}

    const existingSubtasksIds = subtasks.map((s) => s.id)

    const subtasksToUpdate = subtasksIds.filter((s, index) => {
      if (existingSubtasksIds.includes(s)) {
        updatedDescriptionsDict[s] = subtasksDescriptions[index]!
        return true
      }
      return false
    })

    const subtasksToDelete = existingSubtasksIds.filter((s) => !subtasksIds.includes(s))

    const subtasksToInsert = subtasksDescriptions.slice(Object.values(updatedDescriptionsDict).length)

    const NOW = dateGenerator.now()

    const deletePromises = subtasksToDelete.map((id) => new Promise((resolve) => resolve(subtaskRepository.delete(id))))

    const updatePromises = subtasksToUpdate
      .map((id) => subtasks.find((s) => s.id === id))
      .map(
        (subtask) =>
          new Promise((resolve) => {
            resolve(
              subtaskRepository.save({
                ...subtask!,
                description: updatedDescriptionsDict[subtask!.id]!,
                updatedAt: NOW,
              }),
            )
          }),
      )

    const insertPromises = subtasksToInsert.map(
      (description) =>
        new Promise((resolve) => {
          const id = uuidGenerator.next()
          resolve(
            subtaskRepository.save({
              id,
              taskId,
              description,
              updatedAt: NOW,
              createdAt: NOW,
              status: SubtaskStatus.in_progress,
            }),
          )
        }),
    )

    return [deletePromises, updatePromises, insertPromises]
  }
}
