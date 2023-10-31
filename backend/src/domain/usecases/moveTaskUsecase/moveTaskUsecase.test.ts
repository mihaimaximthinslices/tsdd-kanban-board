import { afterEach, vi, describe, beforeEach, expect, it } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { BoardColumnRepository, BoardRepository, TaskRepository, UserRepository } from '../../repositorties'
import { moveTaskUsecase } from './moveTaskUsecase'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { boardBuilder, userBuilder } from '../../../infrastructure/shared'
import { taskBuilder } from '../../../infrastructure/shared/TaskBuilder'
import { boardColumnBuilder } from '../../../infrastructure/shared/BoardColumnBuilder'
import { DateGenerator } from '../../types/DateGenerator'

describe('moveTaskUsecase', () => {
  const userId = 'userId'
  const taskId = 'taskId'
  const columnId = 'columnId'
  const afterTaskId = 'afterTaskId'
  const boardId = 'boardId'

  const NOW = new Date()

  const targetBoardId = 'targetBoardId'

  const toColumnId = 'toColumnId'

  const userRepository = mock<UserRepository>()
  const boardRepository = mock<BoardRepository>()
  const boardColumnRepository = mock<BoardColumnRepository>()
  const taskRepository = mock<TaskRepository>()

  const dateGenerator = mock<DateGenerator>()

  const usecase = moveTaskUsecase({
    userRepository,
    boardRepository,
    boardColumnRepository,
    taskRepository,
    dateGenerator,
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  type Request = {
    userId: string
    taskId: string
    to: {
      columnId: string
      afterTaskId: string | null
    }
  }

  const request: Request = {
    userId,
    taskId,
    to: {
      columnId: toColumnId,
      afterTaskId: afterTaskId,
    },
  }
  const runningTheUsecase = async () => usecase(request)

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
        columnId: columnId,
      })
      const column = boardColumnBuilder.build({
        id: columnId,
        boardId: boardId,
      })

      const board = boardBuilder.build({
        id: boardId,
        userId: 'other-user',
      })
      beforeEach(() => {
        taskRepository.getById.mockResolvedValue(task)
      })
      describe('given the column that is assigned to the task does not exist', () => {
        beforeEach(() => {
          taskRepository.getById.mockResolvedValue(task)
          boardColumnRepository.getById.mockResolvedValue(null)
        })
        it('should throw EntityNotFound', async () => {
          await expect(runningTheUsecase).rejects.toThrow(EntityNotFoundError)
          expect(taskRepository.getById).toHaveBeenCalledWith(taskId)
          expect(boardColumnRepository.getById).toHaveBeenCalledWith(columnId)
        })

        describe('given the column that is assigned to the task exists', () => {
          beforeEach(() => {
            boardColumnRepository.getById.mockResolvedValue(column)
          })

          describe('given the board that is assigned to the column does not exist', () => {
            beforeEach(() => {
              boardRepository.getById.mockResolvedValue(null)
            })
            it('should throw EntityNotFound', async () => {
              await expect(runningTheUsecase).rejects.toThrow(EntityNotFoundError)
              expect(taskRepository.getById).toHaveBeenCalledWith(taskId)
              expect(boardColumnRepository.getById).toHaveBeenCalledWith(columnId)
              expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
            })
            describe('given the board that is assigned to the column exists', () => {
              beforeEach(() => {
                boardRepository.getById.mockResolvedValue(board)
              })
              describe('given the user is not authorized to access this task', () => {
                it('should throw UnauthorizedError', async () => {
                  await expect(runningTheUsecase).rejects.toThrow(UnauthorizedError)
                  expect(taskRepository.getById).toHaveBeenCalledWith(taskId)
                  expect(boardColumnRepository.getById).toHaveBeenCalledWith(columnId)
                  expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
                })

                describe('given the user is authorized to access this task', () => {
                  beforeEach(() => {
                    board.userId = userId
                  })

                  describe('given the target column does not exist', () => {
                    beforeEach(() => {
                      boardColumnRepository.getById.mockResolvedValueOnce(column).mockResolvedValueOnce(null)
                    })

                    it('should throw EntityNotFound', async () => {
                      await expect(runningTheUsecase).rejects.toThrow(EntityNotFoundError)
                      expect(taskRepository.getById).toHaveBeenCalledWith(taskId)
                      expect(boardColumnRepository.getById).toHaveBeenCalledWith(columnId)
                      expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
                      expect(boardColumnRepository.getById).toHaveBeenCalledWith(toColumnId)
                    })
                  })

                  describe('given the target column exists', () => {
                    const targetColumn = boardColumnBuilder.build({
                      id: toColumnId,
                    })
                    beforeEach(() => {
                      boardColumnRepository.getById.mockResolvedValueOnce(column).mockResolvedValueOnce(targetColumn)
                    })

                    describe('given the board that is assigned to the target column does not exist', () => {
                      beforeEach(() => {
                        boardRepository.getById.mockResolvedValueOnce(board).mockResolvedValueOnce(null)
                      })
                      it('should throw EntityNotFound', async () => {
                        await expect(runningTheUsecase).rejects.toThrow(EntityNotFoundError)
                        expect(taskRepository.getById).toHaveBeenCalledWith(taskId)
                        expect(boardColumnRepository.getById).toHaveBeenCalledWith(columnId)
                        expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
                        expect(boardColumnRepository.getById).toHaveBeenCalledWith(toColumnId)
                        expect(boardRepository.getById).toHaveBeenCalledWith(targetColumn.boardId)
                      })

                      describe('given the board that is assigned to the target column exists', () => {
                        const targetBoard = boardBuilder.build({
                          id: targetBoardId,
                        })
                        beforeEach(() => {
                          boardRepository.getById.mockResolvedValueOnce(board).mockResolvedValueOnce(targetBoard)
                        })

                        describe('given the user is not authorized to access this board', () => {
                          beforeEach(() => {
                            boardRepository.getById.mockReset()
                            boardRepository.getById.mockResolvedValueOnce(board).mockResolvedValueOnce(targetBoard)
                          })
                          it('should throw UnauthorizedError', async () => {
                            await expect(runningTheUsecase).rejects.toThrow(UnauthorizedError)
                            expect(taskRepository.getById).toHaveBeenCalledWith(taskId)
                            expect(boardColumnRepository.getById).toHaveBeenCalledWith(columnId)
                            expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
                            expect(boardColumnRepository.getById).toHaveBeenCalledWith(toColumnId)
                            expect(boardRepository.getById).toHaveBeenCalledWith(targetColumn.boardId)
                          })

                          describe('given the user is authorized to access this board', () => {
                            beforeEach(() => {
                              targetBoard.userId = userId
                            })
                            describe('given the afterTaskId is not null', () => {
                              describe('given the afterTask does not exist', () => {
                                beforeEach(() => {
                                  taskRepository.getById.mockReset()
                                  taskRepository.getById.mockResolvedValueOnce(task).mockResolvedValueOnce(null)
                                })
                                it('should throw EntityNotFound error', async () => {
                                  await expect(runningTheUsecase).rejects.toThrow(EntityNotFoundError)
                                  expect(taskRepository.getById).toHaveBeenCalledWith(taskId)
                                  expect(boardColumnRepository.getById).toHaveBeenCalledWith(columnId)
                                  expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
                                  expect(boardColumnRepository.getById).toHaveBeenCalledWith(toColumnId)
                                  expect(boardRepository.getById).toHaveBeenCalledWith(targetColumn.boardId)
                                  expect(taskRepository.getById).toHaveBeenCalledWith(afterTaskId)
                                })
                              })
                              describe('given the afterTask exists', () => {
                                const afterTask = taskBuilder.build({})
                                beforeEach(() => {
                                  taskRepository.getById.mockReset()
                                  taskRepository.getById.mockResolvedValueOnce(task).mockResolvedValueOnce(afterTask)
                                })

                                describe('given the afterTask column id does not match the target column id', () => {
                                  it('should throw InvalidInputError error', async () => {
                                    await expect(runningTheUsecase).rejects.toThrow(InvalidInputError)
                                    expect(taskRepository.getById).toHaveBeenCalledWith(taskId)
                                    expect(boardColumnRepository.getById).toHaveBeenCalledWith(columnId)
                                    expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
                                    expect(boardColumnRepository.getById).toHaveBeenCalledWith(toColumnId)
                                    expect(boardRepository.getById).toHaveBeenCalledWith(targetColumn.boardId)
                                    expect(taskRepository.getById).toHaveBeenCalledWith(afterTaskId)
                                  })
                                })

                                describe('given the afterTask column id matches the target column id', () => {
                                  beforeEach(() => {
                                    taskRepository.getById.mockReset()
                                    taskRepository.getById.mockResolvedValueOnce(task).mockResolvedValueOnce(afterTask)
                                    afterTask.columnId = toColumnId
                                    dateGenerator.now.mockReturnValue(NOW)
                                  })
                                  describe('given the task is situated at the start of the source column and the source column contains only one task', () => {
                                    const previousTask = taskBuilder.build({
                                      taskAfterId: task.id,
                                      columnId: columnId,
                                      taskBeforeId: null,
                                    })

                                    const newAfterTask = taskBuilder.build({
                                      columnId,
                                      taskBeforeId: task.id,
                                      taskAfterId: null,
                                    })
                                    beforeEach(() => {
                                      taskRepository.getById.mockReset()
                                      taskRepository.getById
                                        .mockResolvedValueOnce(task)
                                        .mockResolvedValueOnce(afterTask)
                                        .mockResolvedValueOnce(previousTask)
                                        .mockResolvedValueOnce(newAfterTask)
                                      afterTask.columnId = toColumnId
                                      task.taskBeforeId = null
                                      task.taskAfterId = null
                                    })
                                    it('should not update any pointers in the source column', async () => {
                                      await runningTheUsecase()
                                      expect(taskRepository.save).not.toHaveBeenCalledWith({
                                        ...previousTask,
                                        updatedAt: NOW,
                                        taskAfterId: task.taskAfterId,
                                      })
                                      expect(taskRepository.save).not.toHaveBeenCalledWith({
                                        ...newAfterTask,
                                        taskBeforeId: task.taskBeforeId,
                                        updatedAt: NOW,
                                      })
                                    })
                                    it('should update the next pointer afterTask, the prev and next pointers of the task', async () => {
                                      await runningTheUsecase()

                                      expect(taskRepository.save).toHaveBeenCalledWith({
                                        ...afterTask,
                                        taskAfterId: task.id,
                                        updatedAt: NOW,
                                      })

                                      expect(taskRepository.save).toHaveBeenCalledWith({
                                        ...task,
                                        taskBeforeId: afterTask.id,
                                        taskAfterId: afterTask.taskAfterId,
                                        columnId: toColumnId,
                                        updatedAt: NOW,
                                      })
                                    })
                                  })

                                  describe('given the task is situated at the second position and the column contains two tasks', () => {
                                    const previousTask = taskBuilder.build({
                                      taskAfterId: task.id,
                                      columnId: columnId,
                                      taskBeforeId: null,
                                    })
                                    beforeEach(() => {
                                      taskRepository.getById.mockReset()
                                      taskRepository.getById
                                        .mockResolvedValueOnce(task)
                                        .mockResolvedValueOnce(afterTask)
                                        .mockResolvedValueOnce(previousTask)
                                      afterTask.columnId = toColumnId
                                      task.taskBeforeId = previousTask.id
                                      task.taskAfterId = null
                                    })
                                    it('should update the next pointer of the previous task', async () => {
                                      await runningTheUsecase()
                                      expect(taskRepository.save).toHaveBeenCalledWith({
                                        ...previousTask,
                                        updatedAt: NOW,
                                        taskAfterId: task.taskAfterId,
                                      })
                                    })
                                    it('should update the next pointer afterTask, the prev and next pointers of the task', async () => {
                                      await runningTheUsecase()

                                      expect(taskRepository.save).toHaveBeenCalledWith({
                                        ...afterTask,
                                        taskAfterId: task.id,
                                        updatedAt: NOW,
                                      })

                                      expect(taskRepository.save).toHaveBeenCalledWith({
                                        ...task,
                                        taskBeforeId: afterTask.id,
                                        taskAfterId: afterTask.taskAfterId,
                                        columnId: toColumnId,
                                        updatedAt: NOW,
                                      })
                                    })
                                  })
                                  describe('given the task is situated at the second position and the colum contains tree tasks', () => {
                                    const previousTask = taskBuilder.build({
                                      taskAfterId: task.id,
                                      title: 'prev',
                                      columnId: columnId,
                                      taskBeforeId: null,
                                    })

                                    const newAfterTask = taskBuilder.build({
                                      columnId,
                                      title: 'after',
                                      taskBeforeId: task.id,
                                      taskAfterId: null,
                                    })
                                    beforeEach(() => {
                                      taskRepository.getById.mockReset()
                                      taskRepository.getById
                                        .mockResolvedValueOnce(task)
                                        .mockResolvedValueOnce(afterTask)
                                        .mockResolvedValueOnce(previousTask)
                                        .mockResolvedValueOnce(newAfterTask)
                                      afterTask.columnId = toColumnId
                                      task.taskBeforeId = previousTask.id
                                      task.taskAfterId = newAfterTask.id
                                    })
                                    it('should not update any pointers in the source column', async () => {
                                      await runningTheUsecase()
                                      expect(taskRepository.save).toHaveBeenCalledWith({
                                        ...previousTask,
                                        updatedAt: NOW,
                                        taskAfterId: task.taskAfterId,
                                      })
                                      expect(taskRepository.save).toHaveBeenCalledWith({
                                        ...newAfterTask,
                                        taskBeforeId: task.taskBeforeId,
                                        updatedAt: NOW,
                                      })
                                    })
                                    it('should update the next pointer afterTask, the prev and next pointers of the task', async () => {
                                      await runningTheUsecase()

                                      expect(taskRepository.save).toHaveBeenCalledWith({
                                        ...afterTask,
                                        taskAfterId: task.id,
                                        updatedAt: NOW,
                                      })

                                      expect(taskRepository.save).toHaveBeenCalledWith({
                                        ...task,
                                        taskBeforeId: afterTask.id,
                                        taskAfterId: afterTask.taskAfterId,
                                        columnId: toColumnId,
                                        updatedAt: NOW,
                                      })
                                    })
                                  })
                                })
                              })
                            })
                            describe('given the afterTaskId is null', () => {
                              beforeEach(() => {
                                request.to.afterTaskId = null
                              })
                              describe('given the target column does not contain any other tasks', () => {
                                const previousTask = taskBuilder.build({
                                  taskAfterId: task.id,
                                  columnId: columnId,
                                  taskBeforeId: null,
                                })

                                const newAfterTask = taskBuilder.build({
                                  columnId,
                                  taskBeforeId: task.id,
                                  taskAfterId: null,
                                })
                                beforeEach(() => {
                                  taskRepository.getById.mockReset()
                                  taskRepository.getById
                                    .mockResolvedValueOnce(task)
                                    .mockResolvedValueOnce(previousTask)
                                    .mockResolvedValueOnce(newAfterTask)

                                  taskRepository.getByColumnId.mockResolvedValue([])

                                  task.taskBeforeId = null
                                  task.taskAfterId = null
                                })

                                it('should update the task to be part of the new column and set pointers to null', async () => {
                                  await runningTheUsecase()

                                  expect(taskRepository.save).toHaveBeenCalledWith({
                                    ...task,
                                    columnId: toColumnId,
                                    taskBeforeId: null,
                                    taskAfterId: null,
                                    updatedAt: NOW,
                                  })
                                })
                              })

                              describe('given the target column contains other tasks', () => {
                                const previousTask = taskBuilder.build({
                                  taskAfterId: task.id,
                                  columnId: columnId,
                                  taskBeforeId: null,
                                })

                                const newAfterTask = taskBuilder.build({
                                  columnId,
                                  taskBeforeId: task.id,
                                  taskAfterId: null,
                                })

                                const targetColumnTask1 = taskBuilder.build({
                                  columnId: toColumnId,
                                  taskBeforeId: null,
                                })

                                const targetColumnTask2 = taskBuilder.build({
                                  columnId: toColumnId,
                                  taskBeforeId: targetColumnTask1.id,
                                })

                                targetColumnTask1.taskAfterId = targetColumnTask2.id

                                const targetColumnTask3 = taskBuilder.build({
                                  columnId: toColumnId,
                                  taskBeforeId: targetColumnTask2.id,
                                  taskAfterId: null,
                                })

                                targetColumnTask2.taskAfterId = targetColumnTask3.id

                                const targetColumnTasks = [targetColumnTask3, targetColumnTask1, targetColumnTask2]

                                beforeEach(() => {
                                  taskRepository.getById.mockReset()
                                  taskRepository.getById
                                    .mockResolvedValueOnce(task)
                                    .mockResolvedValueOnce(previousTask)
                                    .mockResolvedValueOnce(newAfterTask)

                                  taskRepository.getByColumnId.mockResolvedValue(targetColumnTasks)

                                  task.taskBeforeId = null
                                  task.taskAfterId = null
                                })

                                it('should update the task to be part of the new column and add it at the start of the linked list', async () => {
                                  await runningTheUsecase()

                                  expect(taskRepository.save).toHaveBeenCalledWith({
                                    ...targetColumnTask1,
                                    taskBeforeId: task.id,
                                    updatedAt: NOW,
                                  })

                                  expect(taskRepository.save).toHaveBeenCalledWith({
                                    ...task,
                                    columnId: toColumnId,
                                    taskBeforeId: null,
                                    taskAfterId: targetColumnTask1.id,
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
              })
            })
          })
        })
      })
    })
  })
})
