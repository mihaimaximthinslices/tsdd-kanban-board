import { afterEach, vi, describe, beforeEach, expect, it } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { getColumnTasksUsecase } from './getColumnTasksUsecase'
import { BoardColumnRepository, BoardRepository, TaskRepository, UserRepository } from '../../repositorties'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { boardBuilder, userBuilder } from '../../../infrastructure/shared'
import { boardColumnBuilder } from '../../../infrastructure/shared/BoardColumnBuilder'
import { taskBuilder } from '../../../infrastructure/shared/TaskBuilder'

describe('getColumnTasksUsecase', () => {
  const userId = 'userId'
  const boardId = 'boardId'
  const columnId = 'columnId'

  const userRepository = mock<UserRepository>()
  const boardRepository = mock<BoardRepository>()
  const boardColumnRepository = mock<BoardColumnRepository>()
  const taskRepository = mock<TaskRepository>()

  const usecase = getColumnTasksUsecase({
    userRepository,
    boardRepository,
    boardColumnRepository,
    taskRepository,
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
  const runningTheUsecase = async () =>
    usecase({
      userId,
      boardId,
      columnId,
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
    describe('given the board does not exist', () => {
      beforeEach(() => {
        boardRepository.getById.mockResolvedValue(null)
      })
      it('should throw EntityNotFoundError', async () => {
        await expect(runningTheUsecase).rejects.toThrow(EntityNotFoundError)
        expect(userRepository.getById).toHaveBeenCalledWith(userId)
        expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
      })
    })

    describe('given the board exists', () => {
      const board = boardBuilder.build({
        id: boardId,
      })

      beforeEach(() => {
        boardRepository.getById.mockResolvedValue(board)
      })

      describe('given the board does not belong to the user', () => {
        it('should throw UnauthorizedError', async () => {
          await expect(runningTheUsecase).rejects.toThrow(UnauthorizedError)
          expect(userRepository.getById).toHaveBeenCalledWith(userId)
          expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
        })
      })
      describe('given the board belongs to the user', () => {
        beforeEach(() => {
          board.userId = userId
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

          describe('given the column is not assigned to the board specified by the user', () => {
            it('should throw UnauthorizedError', async () => {
              await expect(runningTheUsecase).rejects.toThrow(UnauthorizedError)
            })
          })
          describe('given the column is assigned to the board specified by the user', () => {
            const task1 = taskBuilder.build({
              columnId,
              taskBeforeId: null,
            })

            const task2 = taskBuilder.build({
              columnId,
              taskBeforeId: task1.id,
              taskAfterId: null,
            })

            task1.taskAfterId = task2.id

            beforeEach(() => {
              column.boardId = boardId
              taskRepository.getByColumnId.mockResolvedValue([task2, task1])
            })

            it('should return the tasks of the column ordered', async () => {
              const response = await runningTheUsecase()
              expect(response).toEqual([task1, task2])
            })
          })
        })
      })
    })
  })
})
