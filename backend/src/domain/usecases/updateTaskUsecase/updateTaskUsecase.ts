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
import { Subtask, SubtaskStatus, Task } from '../../entities'
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
    const column = await validateColumn(task.columnId, columnId, task)

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

  async function validateColumn(columnId: string, targetColumnId: string, task: Task) {
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
    } else {
      // remake ordering, already tested
      await modifySourceColumn(task)
      await modifyTargetColumn(task, targetColumnId, null)
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
      (description, index) =>
        new Promise((resolve) => {
          const now = dateGenerator.now()
          now.setSeconds(now.getSeconds() + index)
          const id = uuidGenerator.next()
          resolve(
            subtaskRepository.save({
              id,
              taskId,
              description,
              updatedAt: now,
              createdAt: now,
              status: SubtaskStatus.in_progress,
            }),
          )
        }),
    )

    return [deletePromises, updatePromises, insertPromises]
  }
  async function modifySourceColumn(task: Task) {
    const NOW = dateGenerator.now()

    if (task.taskBeforeId) {
      const previousTask = await taskRepository.getById(task.taskBeforeId)

      await taskRepository.save({
        ...previousTask!,
        updatedAt: NOW,
        taskAfterId: task.taskAfterId,
      })
    }

    if (task.taskAfterId) {
      const afterTask = await taskRepository.getById(task.taskAfterId)

      await taskRepository.save({
        ...afterTask!,
        taskBeforeId: task.taskBeforeId,
        updatedAt: NOW,
      })
    }

    const intermediateColumn = uuidGenerator.next()
    await taskRepository.save({
      ...task,
      columnId: intermediateColumn,
      taskBeforeId: null,
      taskAfterId: null,
      updatedAt: NOW,
    })
  }

  async function modifyTargetColumn(task: Task, columnId: string, afterTask: Task | null) {
    const NOW = dateGenerator.now()
    if (!afterTask) {
      const columnTasks = await taskRepository.getByColumnId(columnId)

      const firstTask = columnTasks.find((t) => t.taskBeforeId === null)

      if (firstTask) {
        await taskRepository.save({
          ...firstTask,
          taskBeforeId: task.id,
          updatedAt: NOW,
        })

        await taskRepository.save({
          ...task,
          columnId,
          taskAfterId: firstTask.id,
          taskBeforeId: null,
          updatedAt: NOW,
        })
      } else {
        await taskRepository.save({
          ...task,
          columnId,
          taskBeforeId: null,
          taskAfterId: null,
          updatedAt: NOW,
        })
      }
      return
    }

    if (afterTask) {
      const nextBackup = afterTask.taskAfterId

      await taskRepository.save({
        ...afterTask,
        taskAfterId: task.id,
        updatedAt: NOW,
      })

      await taskRepository.save({
        ...task,
        taskBeforeId: afterTask.id,
        taskAfterId: nextBackup ? nextBackup : null,
        columnId,
        updatedAt: NOW,
      })
    }
  }
}
