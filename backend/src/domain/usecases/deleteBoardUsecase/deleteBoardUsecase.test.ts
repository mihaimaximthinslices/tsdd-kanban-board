import { afterEach, vi, describe, beforeEach, expect, it } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { deleteBoardUsecase } from './deleteBoardUsecase'
import { BoardColumnRepository, BoardRepository, UserRepository } from '../../repositorties'
import { EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { boardBuilder, userBuilder } from '../../../infrastructure/shared'
import { boardColumnBuilder } from '../../../infrastructure/shared/BoardColumnBuilder'

describe('deleteBoardUsecase', () => {
  const userId = 'userId'
  const boardId = 'boardId'

  const userRepository = mock<UserRepository>()
  const boardRepository = mock<BoardRepository>()
  const boardColumnRepository = mock<BoardColumnRepository>()

  const usecase = deleteBoardUsecase({
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
        describe('given the board has columns', () => {
          const [column1, column2] = boardColumnBuilder.buildMany(2, {
            boardId,
          })

          const boardColumns = [column1!, column2!]

          beforeEach(() => {
            boardColumnRepository.getByBoardId.mockResolvedValue(boardColumns)
          })
          it('should delete the board together with the columns', async () => {
            await runningTheUsecase()
            expect(boardColumnRepository.getByBoardId).toHaveBeenCalledWith(boardId)
            expect(boardColumnRepository.delete).toHaveBeenCalledWith(column1!.id)
            expect(boardColumnRepository.delete).toHaveBeenCalledWith(column2!.id)
            expect(boardRepository.delete).toHaveBeenCalledWith(boardId)
          })
        })
        describe('given the board has no columns', () => {
          beforeEach(() => {
            boardColumnRepository.getByBoardId.mockResolvedValue([])
          })
          it('should delete the board', async () => {
            await runningTheUsecase()
            expect(boardColumnRepository.getByBoardId).toHaveBeenCalledWith(boardId)
            expect(boardColumnRepository.delete).not.toHaveBeenCalled()
            expect(boardRepository.delete).toHaveBeenCalledWith(boardId)
          })
        })
      })
    })
  })
})
