import { BoardColumnRepository, BoardRepository, TaskRepository, UserRepository } from '../../repositorties'
import { UseCaseConstructor } from '../../types/UseCase'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { Task } from '../../entities'
import { DateGenerator } from '../../types/DateGenerator'

type Params = {
  userRepository: UserRepository
  boardRepository: BoardRepository
  boardColumnRepository: BoardColumnRepository
  taskRepository: TaskRepository
  dateGenerator: DateGenerator
}

type Request = {
  userId: string
  taskId: string
  to: {
    columnId: string
    afterTaskId: string | null
  }
}

export const moveTaskUsecase: UseCaseConstructor<Params, Request, void> = (params) => {
  const { userRepository, taskRepository, boardColumnRepository, boardRepository, dateGenerator } = params

  return async (request) => {
    const { userId, taskId, to } = request

    const { columnId, afterTaskId } = to

    await validateUser(userId)

    const task = await validateTask(taskId, userId)

    const afterTask = await validateTargetTask(columnId, afterTaskId, userId)

    await modifySourceColumn(task)

    await modifyTargetColumn(task, columnId, afterTask ?? null)
  }

  async function validateUser(userId: string) {
    const user = await userRepository.getById(userId)

    if (!user) {
      throw new InvalidInputError(userId)
    }
  }

  async function validateTask(taskId: string, userId: string) {
    const task = await taskRepository.getById(taskId)

    if (!task) {
      throw new EntityNotFoundError(taskId)
    }

    const column = await boardColumnRepository.getById(task.columnId)

    if (!column) {
      throw new EntityNotFoundError(task.columnId)
    }

    const board = await boardRepository.getById(column.boardId)

    if (!board) {
      throw new EntityNotFoundError(column.boardId)
    }

    if (board.userId !== userId) {
      throw new UnauthorizedError(userId)
    }

    return task
  }

  async function validateTargetTask(columnId: string, afterTaskId: string | null, userId: string) {
    const targetColumn = await boardColumnRepository.getById(columnId)

    if (!targetColumn) {
      throw new EntityNotFoundError(columnId)
    }

    const board = await boardRepository.getById(targetColumn.boardId)

    if (!board) {
      throw new EntityNotFoundError(targetColumn.boardId)
    }

    if (board.userId !== userId) {
      throw new UnauthorizedError(userId)
    }

    if (!afterTaskId) return

    const targetTask = await taskRepository.getById(afterTaskId)

    if (!targetTask) {
      throw new EntityNotFoundError(afterTaskId)
    }

    if (targetTask.columnId !== columnId) {
      throw new InvalidInputError(afterTaskId)
    }

    return targetTask
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
