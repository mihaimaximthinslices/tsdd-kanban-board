import { afterEach, describe, expect, vi, it } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { BoardRepository, UserRepository } from '../../repositorties'
import { createBoardUsecase } from './createBoardUsecase'
import { beforeEach } from 'vitest'
import { DuplicateEntityError, InvalidInputError } from '../../types/Errors'
import { boardBuilder, userBuilder } from '../../../infrastructure/shared'
import { UuidGenerator } from '../../types/UUIDGenerator'
import { DateGenerator } from '../../types/DateGenerator'

describe('createBoardUsecase', () => {
  const userId = 'userId'
  const boardId = 'boardId'
  const now = new Date()

  const boardName = 'boardName'

  const userRepository = mock<UserRepository>()
  const boardRepository = mock<BoardRepository>()

  const uuidGenerator = mock<UuidGenerator>()
  const dateGenerator = mock<DateGenerator>()

  const usecase = createBoardUsecase({
    userRepository,
    boardRepository,
    uuidGenerator,
    dateGenerator,
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
  const runningTheUsecase = async () =>
    usecase({
      userId: userId,
      boardName: boardName,
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

    describe('given the board name already exists', () => {
      const board = boardBuilder.build({
        userId,
        boardName,
      })
      beforeEach(() => {
        boardRepository.getByUserIdAndBoardName.mockResolvedValue(board)
      })
      it('should throw DuplicateEntityError', async () => {
        await expect(runningTheUsecase).rejects.toThrow(DuplicateEntityError)
        expect(userRepository.getById).toHaveBeenCalledWith(userId)
        expect(boardRepository.getByUserIdAndBoardName).toHaveBeenCalledWith(userId, boardName)
      })
    })

    describe('given the board name is unique', () => {
      beforeEach(() => {
        boardRepository.getByUserIdAndBoardName.mockResolvedValue(null)
        uuidGenerator.next.mockReturnValue(boardId)
        dateGenerator.now.mockReturnValue(now)
      })
      it('should create the board', async () => {
        const result = await runningTheUsecase()
        expect(userRepository.getById).toHaveBeenCalledWith(userId)
        expect(boardRepository.getByUserIdAndBoardName).toHaveBeenCalledWith(userId, boardName)
        expect(boardRepository.save).toHaveBeenCalledWith({
          id: boardId,
          userId: userId,
          boardName: boardName,
          createdAt: now,
          updatedAt: now,
        })
        expect(result).toEqual({ id: boardId, userId: userId, boardName: boardName, createdAt: now, updatedAt: now })
      })
    })
  })
})
