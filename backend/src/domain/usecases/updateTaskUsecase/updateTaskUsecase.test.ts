import { afterEach, describe, expect, vi, it } from 'vitest'
import { mock } from 'vitest-mock-extended'
import {
  BoardColumnRepository,
  BoardRepository,
  SubtaskRepository,
  TaskRepository,
  UserRepository,
} from '../../repositorties'
import { beforeEach } from 'vitest'
import { updateTaskUsecase } from './updateTaskUsecase'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { UuidGenerator } from '../../types/UUIDGenerator'
import { DateGenerator } from '../../types/DateGenerator'
import { boardBuilder, subtaskBuilder, userBuilder } from '../../../infrastructure/shared'
import { boardColumnBuilder } from '../../../infrastructure/shared/BoardColumnBuilder'
import { SubtaskStatus } from '../../entities'
import { taskBuilder } from '../../../infrastructure/shared/TaskBuilder'

describe('updateTaskUsecase', () => {
  const userId = 'userId'
  const newSubtaskId = 'newSubtaskId'

  const taskTitle = 'task title'
  const taskDescription = 'task description'

  const targetColumnId = 'targetColumnId'

  const taskId = 'taskId'

  const NOW = new Date()

  const subtask1 = 'subtask1'
  const subtaskId1 = 'subtaskId1'
  const subtask2 = 'subtask2'
  const subtaskId2 = 'subtaskId2'

  const subtask3 = 'subtask3'

  const subtask4 = 'subtask4'

  const boardId = 'boardId'

  const notSpecifiedSubtask1 = 'notSpecifiedSubtask1'
  const notSpecifiedSubtaskId1 = 'notSpecifiedSubtaskId1'
  const notSpecifiedSubtask2 = 'notSpecifiedSubtask2'
  const notSpecifiedSubtaskId2 = 'notSpecifiedSubtaskId2'

  const subtasks = [subtask1, subtask2, subtask3, subtask4]
  const subtasksIds = [subtaskId1, subtaskId2]

  const userRepository = mock<UserRepository>()
  const boardRepository = mock<BoardRepository>()
  const boardColumnRepository = mock<BoardColumnRepository>()
  const taskRepository = mock<TaskRepository>()
  const subtaskRepository = mock<SubtaskRepository>()

  const uuidGenerator = mock<UuidGenerator>()
  const dateGenerator = mock<DateGenerator>()

  const usecase = updateTaskUsecase({
    userRepository,
    boardRepository,
    boardColumnRepository,
    subtaskRepository,
    uuidGenerator,
    dateGenerator,
    taskRepository,
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
  const runningTheUsecase = async () =>
    usecase({
      userId,
      taskId,
      subtasks,
      subtasksIds,
      taskTitle,
      taskDescription,
      columnId: targetColumnId,
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
    describe('given the task does not exist', () => {
      beforeEach(() => {
        taskRepository.getById.mockResolvedValue(null)
      })
      it('should throw EntityNotFoundError', async () => {
        await expect(runningTheUsecase).rejects.toThrow(EntityNotFoundError)
        expect(taskRepository.getById).toHaveBeenCalledWith(taskId)
      })
    })

    describe('given the task exists', () => {
      const task = taskBuilder.build({
        id: taskId,
      })

      beforeEach(() => {
        taskRepository.getById.mockResolvedValue(task)
      })
      describe('given the column does not exist', () => {
        beforeEach(() => {
          boardColumnRepository.getById.mockResolvedValue(null)
        })
        it('should throw EntityNotFoundError', async () => {
          await expect(runningTheUsecase).rejects.toThrow(EntityNotFoundError)
          expect(boardColumnRepository.getById).toHaveBeenCalledWith(task.columnId)
        })
      })
      describe('given the column exists', () => {
        const column = boardColumnBuilder.build({
          id: task.columnId,
          boardId,
        })
        beforeEach(() => {
          boardColumnRepository.getById.mockResolvedValueOnce(column).mockResolvedValueOnce(null)
        })

        describe('given the target column does not exist', () => {
          beforeEach(() => {
            boardColumnRepository.getById.mockReset()
            boardColumnRepository.getById.mockResolvedValueOnce(column).mockResolvedValueOnce(null)
          })
          it('should throw EntityNotFoundError', async () => {
            await expect(runningTheUsecase).rejects.toThrow(EntityNotFoundError)
            expect(boardColumnRepository.getById).toHaveBeenCalledWith(task.columnId)
            expect(boardColumnRepository.getById).toHaveBeenCalledWith(targetColumnId)
          })
        })
        describe('given the target column does exist', () => {
          const targetColumn = boardColumnBuilder.build({
            id: targetColumnId,
          })

          beforeEach(() => {
            boardColumnRepository.getById.mockReset()
            boardColumnRepository.getById.mockResolvedValueOnce(column).mockResolvedValueOnce(targetColumn)
          })
          describe('given the target column does not belong to the same board', () => {
            beforeEach(() => {
              targetColumn.boardId = 'some-other-board'
            })
            it('should throw UnauthorizedError', async () => {
              await expect(runningTheUsecase).rejects.toThrow(UnauthorizedError)
              expect(boardColumnRepository.getById).toHaveBeenCalledWith(task.columnId)
              expect(boardColumnRepository.getById).toHaveBeenCalledWith(targetColumnId)
            })
          })
          describe('given the target column belongs to the same board', () => {
            beforeEach(() => {
              targetColumn.boardId = boardId
            })
            describe('given the board does not exist', () => {
              beforeEach(() => {
                boardRepository.getById.mockResolvedValue(null)
              })
              it('should throw EntityNotFoundError', async () => {
                await expect(runningTheUsecase).rejects.toThrow(EntityNotFoundError)
                expect(boardRepository.getById).toHaveBeenCalledWith(column.boardId)
              })
            })
            describe('given the board exists', () => {
              const board = boardBuilder.build({
                id: boardId,
              })
              beforeEach(() => {
                boardRepository.getById.mockResolvedValue(board)
              })
              describe('given the user is not authorized to access the board', () => {
                it('should throw UnauthorizedError', async () => {
                  await expect(runningTheUsecase).rejects.toThrow(UnauthorizedError)
                })
              })
              describe('given the user is authorized to access the board', () => {
                const alreadyExistingSubtask1 = subtaskBuilder.build({
                  taskId,
                  id: subtaskId1,
                  description: subtask1,
                })

                const alreadyExistingSubtask2 = subtaskBuilder.build({
                  taskId,
                  id: subtaskId2,
                  description: subtask2,
                })

                const alreadyExistingSubtasks = [
                  alreadyExistingSubtask1,
                  alreadyExistingSubtask2,
                  subtaskBuilder.build({
                    taskId,
                    id: notSpecifiedSubtaskId1,
                    description: notSpecifiedSubtask1,
                  }),
                  subtaskBuilder.build({
                    taskId,
                    id: notSpecifiedSubtaskId2,
                    description: notSpecifiedSubtask2,
                  }),
                ]

                beforeEach(() => {
                  board.userId = userId
                  dateGenerator.now.mockReturnValue(NOW)
                  uuidGenerator.next.mockReturnValue(newSubtaskId)

                  subtaskRepository.getByTaskId.mockResolvedValue(alreadyExistingSubtasks)
                })

                it('should update the task and subtasks and delete subtasks if their id is not provided', async () => {
                  await runningTheUsecase()

                  expect(subtaskRepository.delete).toHaveBeenCalledWith(notSpecifiedSubtaskId1)
                  expect(subtaskRepository.delete).toHaveBeenCalledWith(notSpecifiedSubtaskId2)

                  expect(subtaskRepository.save).toHaveBeenCalledWith({
                    ...alreadyExistingSubtask1,
                    description: subtask1,
                    updatedAt: NOW,
                  })

                  expect(subtaskRepository.save).toHaveBeenCalledWith({
                    ...alreadyExistingSubtask2,
                    description: subtask2,
                    updatedAt: NOW,
                  })

                  expect(subtaskRepository.save).toHaveBeenCalledWith({
                    id: newSubtaskId,
                    description: subtask3,
                    taskId: taskId,
                    status: SubtaskStatus.in_progress,
                    updatedAt: NOW,
                    createdAt: NOW,
                  })
                  expect(subtaskRepository.save).toHaveBeenCalledWith({
                    id: newSubtaskId,
                    description: subtask4,
                    taskId: taskId,
                    status: SubtaskStatus.in_progress,
                    updatedAt: NOW,
                    createdAt: NOW,
                  })

                  expect(taskRepository.save).toHaveBeenCalledWith({
                    ...task,
                    title: taskTitle,
                    description: taskDescription,
                    columnId: targetColumnId,
                    updatedAt: NOW,
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})
