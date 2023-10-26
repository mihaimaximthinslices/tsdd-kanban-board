import { afterEach, describe, expect, vi, it } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { BoardColumnRepository, BoardRepository, UserRepository } from '../../repositorties'
import { beforeEach } from 'vitest'
import { updateBoardUsecase } from './updateBoardUsecase'
import { DuplicateEntityError, EntityNotFoundError, InvalidInputError, UnauthorizedError } from '../../types/Errors'
import { UuidGenerator } from '../../types/UUIDGenerator'
import { DateGenerator } from '../../types/DateGenerator'
import { boardBuilder, userBuilder } from '../../../infrastructure/shared'
import { boardColumnBuilder } from '../../../infrastructure/shared/BoardColumnBuilder'
import { Board, BoardColumn } from '../../entities'

describe.only('updateBoardUsecase', () => {
  const userId = 'userId'

  const boardName = 'boardName'

  const boardId = 'boardId'

  const now = new Date()

  const columnName1 = 'column1'
  const columnId1 = 'columnId1'
  const columnName2 = 'column2'
  const columnId2 = 'columnId2'

  const columnName3 = 'column3'

  const columnName4 = 'column3'

  const columnNames = [columnName1, columnName2, columnName3, columnName4]
  const columnIds = [columnId1, columnId2]

  const userRepository = mock<UserRepository>()
  const boardRepository = mock<BoardRepository>()
  const boardColumnRepository = mock<BoardColumnRepository>()

  const uuidGenerator = mock<UuidGenerator>()
  const dateGenerator = mock<DateGenerator>()

  const usecase = updateBoardUsecase({
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
      boardName,
      boardId,
      columnNames,
      columnIds,
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

        describe('given there already exists a board with the new board name and the board id is different', () => {
          const alreadyExistingBoardDifferentId = boardBuilder.build({
            userId: userId,
            boardName: boardName,
            id: 'some-other-board-id',
          })
          beforeEach(() => {
            boardRepository.getByUserIdAndBoardName.mockResolvedValue(alreadyExistingBoardDifferentId)
          })

          it('should throw DuplicateEntityError', async () => {
            await expect(runningTheUsecase).rejects.toThrow(DuplicateEntityError)
            expect(boardRepository.getByUserIdAndBoardName).toHaveBeenCalledWith(userId, boardName)
          })
          afterEach(() => {
            boardRepository.getByUserIdAndBoardName.mockResolvedValue(board)
          })
        })

        const nonMatchingBoardColumn1 = boardColumnBuilder.build({
          id: 'non-matching-column-id-1',
        })
        const nonMatchingBoardColumn2 = boardColumnBuilder.build({
          id: 'non-matching-column-id-2',
        })

        const matchingBoardColumn1 = boardColumnBuilder.build({
          id: columnId1,
        })

        const matchingBoardColumn2 = boardColumnBuilder.build({
          id: columnId2,
        })

        describe('given the provided columnIds do not match the actual column ids of the already existing columns', () => {
          describe('given none of the ids match', () => {
            beforeEach(() => {
              boardColumnRepository.getByBoardId.mockResolvedValue([nonMatchingBoardColumn1, nonMatchingBoardColumn2])
            })
            it('should throw invalidInputError if none of the ids match', async () => {
              await expect(runningTheUsecase).rejects.toThrow(InvalidInputError)
              expect(boardColumnRepository.getByBoardId).toHaveBeenCalledWith(boardId)
            })
          })
          describe('given some ids match and some don t', () => {
            beforeEach(() => {
              boardColumnRepository.getByBoardId.mockResolvedValue([matchingBoardColumn1, nonMatchingBoardColumn2])
            })
            it('should throw invalidInputError', async () => {
              await expect(runningTheUsecase).rejects.toThrow(InvalidInputError)
              expect(boardColumnRepository.getByBoardId).toHaveBeenCalledWith(boardId)
            })
          })
          describe('given all provided ids match but not all are present', () => {
            beforeEach(() => {
              boardColumnRepository.getByBoardId.mockResolvedValue([matchingBoardColumn1])
            })
            it('should throw invalidInputError', async () => {
              await expect(runningTheUsecase).rejects.toThrow(InvalidInputError)
              expect(boardColumnRepository.getByBoardId).toHaveBeenCalledWith(boardId)
            })
          })
        })

        describe('given the provided columnIds match the actual column ids of the already existing columns', () => {
          beforeEach(() => {
            boardColumnRepository.getByBoardId.mockResolvedValue([matchingBoardColumn1, matchingBoardColumn2])
            uuidGenerator.next.mockReturnValue('new-column-id')
            dateGenerator.now.mockReturnValue(now)
          })

          it('should update the board and its columns', async () => {
            const boardUpdate: Board = {
              id: board.id,
              userId: board.userId,
              boardName: boardName,
              createdAt: board.createdAt,
              updatedAt: now,
            }

            const columnUpdate1: BoardColumn = {
              id: matchingBoardColumn1.id,
              boardId: matchingBoardColumn1.boardId,
              columnName: columnName1,
              createdAt: matchingBoardColumn1.createdAt,
              updatedAt: now,
            }

            const columnUpdate2: BoardColumn = {
              id: matchingBoardColumn2.id,
              boardId: matchingBoardColumn2.boardId,
              columnName: columnName2,
              createdAt: matchingBoardColumn2.createdAt,
              updatedAt: now,
            }

            const newColumn1: BoardColumn = {
              id: uuidGenerator.next(),
              boardId: boardId,
              columnName: columnName3,
              createdAt: now,
              updatedAt: now,
            }

            const newColumn2: BoardColumn = {
              id: uuidGenerator.next(),
              boardId: boardId,
              columnName: columnName4,
              createdAt: now,
              updatedAt: now,
            }

            await runningTheUsecase()

            expect(boardRepository.save).toHaveBeenCalledWith(boardUpdate)

            expect(boardColumnRepository.save).toHaveBeenCalledWith(columnUpdate1)
            expect(boardColumnRepository.save).toHaveBeenCalledWith(columnUpdate2)
            expect(boardColumnRepository.save).toHaveBeenCalledWith(newColumn1)
            expect(boardColumnRepository.save).toHaveBeenCalledWith(newColumn2)
          })
        })
      })
    })
  })
})
