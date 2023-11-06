import { BoardColumnRepository, BoardRepository, SubtaskRepository, TaskRepository } from '../../repositorties'
import { UseCaseConstructor } from '../../types/UseCase'
import { Board, ImportedBoards, Subtask, SubtaskStatus, Task } from '../../entities'
import { DateGenerator } from '../../types/DateGenerator'
import { UuidGenerator } from '../../types/UUIDGenerator'
import { uuidGenerator } from '../../../infrastructure/shared'
import { BoardColumn } from '@prisma/client'

type Params = {
  boardRepository: BoardRepository
  boardColumnRepository: BoardColumnRepository
  taskRepository: TaskRepository
  subtasksRepository: SubtaskRepository
  dateGenerator: DateGenerator
  uuidGenerator: UuidGenerator
}

type Request = {
  userId: string
  importedBoards: ImportedBoards
}

export const populateBoardsUsecase: UseCaseConstructor<Params, Request, void> = (params) => {
  const { taskRepository, boardColumnRepository, boardRepository, dateGenerator, subtasksRepository } = params

  return async (request) => {
    const { userId, importedBoards } = request

    const { boards } = importedBoards

    for (let i = 0; i < boards.length; i++) {
      const NOW = dateGenerator.now()
      const board = boards[i]!
      const boardEntity: Board = {
        boardName: board.name,
        userId: userId,
        id: uuidGenerator.next(),
        updatedAt: NOW,
        createdAt: NOW,
      }
      await boardRepository.save(boardEntity)

      for (let j = 0; j < board.columns.length; j++) {
        const column = board.columns[j]!
        const columnEntity: BoardColumn = {
          id: uuidGenerator.next(),
          boardId: boardEntity.id,
          columnName: column.name,
          updatedAt: NOW,
          createdAt: NOW,
        }
        await boardColumnRepository.save(columnEntity)

        const taskEntities: Task[] = []
        for (let k = 0; k < column.tasks.length; k++) {
          const task = column.tasks[k]!

          const taskEntity: Task = {
            columnId: columnEntity.id,
            taskBeforeId: null,
            taskAfterId: null,
            description: task.description,
            title: task.title,
            id: uuidGenerator.next(),
            updatedAt: NOW,
            createdAt: NOW,
          }

          taskEntities.push(taskEntity)

          for (let l = 0; l < task.subtasks.length; l++) {
            const subtask = task.subtasks[l]!
            const subtaskEntity: Subtask = {
              id: uuidGenerator.next(),
              status: subtask.isCompleted ? SubtaskStatus.completed : SubtaskStatus.in_progress,
              description: subtask.title,
              taskId: taskEntity.id,
              updatedAt: NOW,
              createdAt: NOW,
            }

            await subtasksRepository.save(subtaskEntity)
          }

          let previousTask: null | Task = null

          for (let m = 0; m < taskEntities.length; m++) {
            const currentTaskEntity = taskEntities[m]!
            currentTaskEntity.taskBeforeId = previousTask?.id ?? null
            if (previousTask) {
              previousTask.taskAfterId = currentTaskEntity.id
            }
            previousTask = currentTaskEntity

            await taskRepository.save(currentTaskEntity)
          }
        }
      }
    }
  }
}
