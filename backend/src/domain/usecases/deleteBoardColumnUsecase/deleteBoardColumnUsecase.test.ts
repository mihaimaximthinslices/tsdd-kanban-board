import { afterEach, vi, describe, beforeEach, expect, it } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { BoardColumnRepository, BoardRepository, UserRepository } from '../../repositorties'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { boardBuilder, userBuilder } from '../../../infrastructure/shared'
import { boardColumnBuilder } from '../../../infrastructure/shared/BoardColumnBuilder'

import { deleteBoardColumnUsecase } from './deleteBoardColumnUsecase'

describe('deleteBoardColumnUsecase', () => {
  const userId = 'userId'
  const boardId = 'boardId'
  const columnId = 'columnId'

  const userRepository = mock<UserRepository>()
  const boardRepository = mock<BoardRepository>()
  const boardColumnRepository = mock<BoardColumnRepository>()

  const usecase = deleteBoardColumnUsecase({
    userRepository,
    boardRepository,
    boardColumnRepository,
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

        describe('given the column is not found', () => {
          beforeEach(() => {
            boardColumnRepository.getById.mockResolvedValue(null)
          })

          it('should throw EntityNotFoundError', async () => {
            await expect(runningTheUsecase).rejects.toThrow(EntityNotFoundError)
            expect(userRepository.getById).toHaveBeenCalledWith(userId)
            expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
            expect(boardColumnRepository.getById).toHaveBeenCalledWith(columnId)
          })
        })

        describe('given the column is found', () => {
          const column = boardColumnBuilder.build({})
          beforeEach(() => {
            boardColumnRepository.getById.mockResolvedValue(column)
          })

          describe('given the column does not belong to the board', () => {
            it('should throw UnauthorizedError', async () => {
              await expect(runningTheUsecase).rejects.toThrow(UnauthorizedError)
              expect(userRepository.getById).toHaveBeenCalledWith(userId)
              expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
              expect(boardColumnRepository.getById).toHaveBeenCalledWith(columnId)
            })
          })
          describe('given the column belongs to the board', () => {
            beforeEach(() => {
              column.boardId = boardId
            })

            it('should delete the column', async () => {
              await runningTheUsecase()
              expect(userRepository.getById).toHaveBeenCalledWith(userId)
              expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
              expect(boardColumnRepository.getById).toHaveBeenCalledWith(columnId)
              expect(boardColumnRepository.delete).toHaveBeenCalledWith(columnId)
            })
          })
        })
      })
    })
  })
})
