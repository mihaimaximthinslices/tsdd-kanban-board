import { afterEach, describe, expect, vi, it, beforeEach } from 'vitest'
import { mock } from 'vitest-mock-extended'
import {
  BoardColumnRepository,
  BoardRepository,
  SubtaskRepository,
  TaskRepository,
  UserRepository,
} from '../../repositorties'
import { createTaskUsecase } from './createTaskUsecase'
import { UuidGenerator } from '../../types/UUIDGenerator'
import { DateGenerator } from '../../types/DateGenerator'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { boardBuilder, userBuilder } from '../../../infrastructure/shared'
import { boardColumnBuilder } from '../../../infrastructure/shared/BoardColumnBuilder'
import { taskBuilder } from '../../../infrastructure/shared/TaskBuilder'
import { SubtaskStatus } from '../../entities'

describe('createTaskUsecase', () => {
  const userId = 'userId'
  const boardId = 'boardId'
  const columnId = 'columnId'
  const newTaskId = 'newTaskId'
  const title = 'title'
  const description = 'description'

  const subtask1 = 'subtask1'
  const subtask1Id = 'subtask1Id'

  const subtask2 = 'subtask2'
  const subtask2Id = 'subtask2Id'

  const subtasks = [subtask1, subtask2]
  const now = new Date()

  const userRepository = mock<UserRepository>()
  const boardRepository = mock<BoardRepository>()
  const boardColumnRepository = mock<BoardColumnRepository>()
  const taskRepository = mock<TaskRepository>()
  const subtaskRepository = mock<SubtaskRepository>()

  const uuidGenerator = mock<UuidGenerator>()
  const dateGenerator = mock<DateGenerator>()

  const usecase = createTaskUsecase({
    userRepository,
    boardRepository,
    boardColumnRepository,
    taskRepository,
    subtaskRepository,
    uuidGenerator,
    dateGenerator,
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
  const runningTheUsecase = async () =>
    usecase({
      userId: userId,
      columnId: columnId,
      title,
      description,
      subtasks,
    })

  describe('given the user does not exist', () => {
    beforeEach(() => {
      userRepository.getById.mockResolvedValue(null)
    })
    it('should throw InvalidInputError', async () => {
      await expect(runningTheUsecase).rejects.toThrow(InvalidInputError)
      expect(userRepository.getById).toHaveBeenCalledWith(userId)
    })
  })
  describe('given the user exists', () => {
    const user = userBuilder.build({
      id: userId,
    })

    beforeEach(() => {
      userRepository.getById.mockResolvedValue(user)
    })

    describe('given the column does not exist', () => {
      beforeEach(() => {
        boardColumnRepository.getById.mockResolvedValue(null)
      })
      it('should throw EntityNotFoundError', async () => {
        await expect(runningTheUsecase).rejects.toThrow(EntityNotFoundError)
        expect(boardColumnRepository.getById).toHaveBeenCalledWith(columnId)
      })
    })

    describe('given the column exists', () => {
      const column = boardColumnBuilder.build({
        id: columnId,
      })
      beforeEach(() => {
        boardColumnRepository.getById.mockResolvedValue(column)
      })

      describe('give the board assigned to the column does not exist', () => {
        beforeEach(() => {
          boardRepository.getById.mockResolvedValue(null)
        })
        it('should throw EntityNotFoundError', async () => {
          await expect(runningTheUsecase).rejects.toThrow(EntityNotFoundError)
          expect(boardRepository.getById).toHaveBeenCalledWith(column.boardId)
        })
      })

      describe('given the board assigned to the column exists', () => {
        const board = boardBuilder.build({
          id: boardId,
        })
        beforeEach(() => {
          boardRepository.getById.mockResolvedValue(board)
        })
        describe('given the column is not assigned to a board that is owned by the user', () => {
          it('should throw UnauthorizedError', async () => {
            await expect(runningTheUsecase).rejects.toThrow(UnauthorizedError)
            expect(boardColumnRepository.getById).toHaveBeenCalledWith(columnId)
            expect(boardRepository.getById).toHaveBeenCalledWith(column.boardId)
          })
        })

        describe('given the column is assigned to a board that is owned by the user', () => {
          const board = boardBuilder.build({
            id: boardId,
            userId: userId,
          })
          beforeEach(() => {
            boardRepository.getById.mockResolvedValue(board)
            dateGenerator.now.mockReturnValue(now)
          })
          describe('given there are no other tasks in the column', () => {
            beforeEach(() => {
              taskRepository.getByColumnId.mockResolvedValue([])
              uuidGenerator.next
                .mockReturnValueOnce(newTaskId)
                .mockReturnValueOnce(subtask1Id)
                .mockReturnValueOnce(subtask2Id)
            })
            it('should create a task with beforeTaskId as null and afterTaskId as null', async () => {
              await runningTheUsecase()
              expect(taskRepository.save).toHaveBeenCalledWith({
                id: newTaskId,
                taskBeforeId: null,
                taskAfterId: null,
                columnId: columnId,
                title: title,
                description: description,
                createdAt: now,
                updatedAt: now,
              })

              expect(subtaskRepository.save).toHaveBeenCalledWith({
                id: subtask1Id,
                taskId: newTaskId,
                description: subtask1,
                status: SubtaskStatus.in_progress,
                createdAt: now,
                updatedAt: now,
              })
              expect(subtaskRepository.save).toHaveBeenCalledWith({
                id: subtask2Id,
                taskId: newTaskId,
                description: subtask2,
                status: SubtaskStatus.in_progress,
                createdAt: now,
                updatedAt: now,
              })
            })
          })

          describe('given there are other tasks in the column', () => {
            const firstTaskId = 'first-task-id'
            const secondTaskId = 'second-task-id'

            const firstTask = taskBuilder.build({
              id: firstTaskId,
              columnId,
            })

            const secondTask = taskBuilder.build({
              id: secondTaskId,
              columnId,
            })

            beforeEach(() => {
              firstTask.taskBeforeId = null
              firstTask.taskBeforeId = secondTask.id
              secondTask.taskBeforeId = firstTask.id
              secondTask.taskAfterId = null
              taskRepository.getByColumnId.mockResolvedValue([firstTask, secondTask])
              uuidGenerator.next
                .mockReturnValueOnce(newTaskId)
                .mockReturnValueOnce(subtask1Id)
                .mockReturnValueOnce(subtask2Id)
            })

            it('should create a task with beforeTaskId as secondTask.id, taskAfterId as null and update secondTask.taskAfterId as newTaskId', async () => {
              await runningTheUsecase()

              expect(taskRepository.save).toHaveBeenCalledWith({
                id: newTaskId,
                taskBeforeId: secondTask.id,
                taskAfterId: null,
                columnId: columnId,
                title: title,
                description: description,
                createdAt: now,
                updatedAt: now,
              })

              expect(subtaskRepository.save).toHaveBeenCalledWith({
                id: subtask1Id,
                taskId: newTaskId,
                description: subtask1,
                status: SubtaskStatus.in_progress,
                createdAt: now,
                updatedAt: now,
              })
              expect(subtaskRepository.save).toHaveBeenCalledWith({
                id: subtask2Id,
                taskId: newTaskId,
                description: subtask2,
                status: SubtaskStatus.in_progress,
                createdAt: now,
                updatedAt: now,
              })

              expect(taskRepository.save).toHaveBeenCalledWith({
                id: secondTask.id,
                taskBeforeId: secondTask.taskBeforeId,
                taskAfterId: newTaskId,
                columnId: secondTask.columnId,
                title: secondTask.title,
                description: secondTask.description,
                createdAt: secondTask.createdAt,
                updatedAt: now,
              })
            })
          })
        })
      })
    })
  })
})
