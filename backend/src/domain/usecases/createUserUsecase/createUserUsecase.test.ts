import { afterEach, vi, describe, expect, test, beforeEach } from 'vitest'
import { mock } from 'vitest-mock-extended'
import { userBuilder } from '../../../infrastructure/shared'
import { createUserUsecase } from './createUserUsecase'
import { UserRepository } from '../../repositorties'
import { UuidGenerator } from '../../types/UUIDGenerator'
import { DateGenerator } from '../../types/DateGenerator'
import { DuplicateEntityError } from '../../types/Errors'

describe('createUserUsecase', () => {
  const password = 'hashed-password'
  const email = 'email'
  const userId = 'userId'
  const now = new Date()

  const userRepository = mock<UserRepository>()

  const uuidGenerator = mock<UuidGenerator>()

  const dateGenerator = mock<DateGenerator>()

  const usecase = createUserUsecase({
    userRepository,
    uuidGenerator,
    dateGenerator,
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
  const runningTheUsecase = async () =>
    usecase({
      email: email,
      password: password,
    })

  describe('given the user already exists', () => {
    const alreadyExistingUser = userBuilder.build({
      email: email,
    })
    beforeEach(() => {
      userRepository.getByEmail.mockResolvedValue(alreadyExistingUser)
    })

    test('should throw DuplicateEntityError', async () => {
      await expect(runningTheUsecase).rejects.toThrow(DuplicateEntityError)
      expect(userRepository.getByEmail).toHaveBeenCalledWith(email)
    })
  })

  describe('given the user does not exist', () => {
    beforeEach(() => {
      userRepository.getByEmail.mockResolvedValue(null)
      uuidGenerator.next.mockReturnValue(userId)
      dateGenerator.now.mockReturnValue(now)
    })
    test('should create the user', async () => {
      await runningTheUsecase()
      expect(userRepository.getByEmail).toHaveBeenCalledWith(email)
      expect(userRepository.save).toHaveBeenCalledWith({
        id: userId,
        email: email,
        password: password,
        createdAt: now,
        updatedAt: now,
      })
    })
  })
})
