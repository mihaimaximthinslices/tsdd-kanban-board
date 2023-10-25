import { afterEach, describe, expect, vi, it } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { BoardRepository, UserRepository } from '../../repositorties'
import { beforeEach } from 'vitest'
import { DuplicateEntityError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { boardBuilder, userBuilder } from '../../../infrastructure/shared'
import { UuidGenerator } from '../../types/UUIDGenerator'
import { DateGenerator } from '../../types/DateGenerator'
import { createBoardColumnUsecase } from './createBoardColumn'
import { BoardColumnRepository } from '../../repositorties'
import { boardColumnBuilder } from '../../../infrastructure/shared/BoardColumnBuilder'

describe('createBoardColumnUsecase', () => {
  const userId = 'userId'
  const boardId = 'boardId'
  const columnId = 'columnId'
  const columnName = 'columnName'

  const now = new Date()

  const userRepository = mock<UserRepository>()
  const boardRepository = mock<BoardRepository>()
  const boardColumnRepository = mock<BoardColumnRepository>()

  const uuidGenerator = mock<UuidGenerator>()
  const dateGenerator = mock<DateGenerator>()

  const usecase = createBoardColumnUsecase({
    userRepository,
    boardRepository,
    boardColumnRepository,
    uuidGenerator,
    dateGenerator,
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
  const runningTheUsecase = async () =>
    usecase({
      userId,
      columnName,
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

      it('should throw InvalidInputError', async () => {
        await expect(runningTheUsecase).rejects.toThrow(InvalidInputError)
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

      describe('given the user is not the owner of the board', () => {
        beforeEach(() => {
          board.userId = 'not-owner'
        })

        it('should throw UnauthorizedError', async () => {
          await expect(runningTheUsecase).rejects.toThrow(UnauthorizedError)
          expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
        })
      })
      describe('given the user is the owner of the board', () => {
        beforeEach(() => {
          board.userId = userId
        })

        describe('given the column name is already taken', () => {
          const column = boardColumnBuilder.build({
            boardId,
            columnName,
          })
          beforeEach(() => {
            boardColumnRepository.getByBoardIdAndColumnName.mockResolvedValue(column)
          })
          it('should throw DuplicateEntityError', async () => {
            await expect(runningTheUsecase).rejects.toThrow(DuplicateEntityError)
            expect(boardColumnRepository.getByBoardIdAndColumnName).toHaveBeenCalledWith(boardId, columnName)
          })
        })

        describe('given the column name is not taken', () => {
          beforeEach(() => {
            boardColumnRepository.getByBoardIdAndColumnName.mockResolvedValue(null)
            uuidGenerator.next.mockReturnValue(columnId)
            dateGenerator.now.mockReturnValue(now)
          })
          it('should return the created column', async () => {
            const response = await runningTheUsecase()
            expect(userRepository.getById).toHaveBeenCalledWith(userId)
            expect(boardRepository.getById).toHaveBeenCalledWith(boardId)
            expect(boardColumnRepository.getByBoardIdAndColumnName).toHaveBeenCalledWith(boardId, columnName)

            expect(boardColumnRepository.save).toHaveBeenCalledWith({
              id: columnId,
              boardId: boardId,
              columnName: columnName,
              createdAt: now,
              updatedAt: now,
            })

            expect(response).toEqual({
              id: columnId,
              boardId: boardId,
              columnName: columnName,
              createdAt: now,
              updatedAt: now,
            })
          })
        })
      })
    })
  })
})
