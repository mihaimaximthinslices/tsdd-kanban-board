import { UserRepository } from '../../repositorties'
import { UseCaseConstructor } from '../../types/UseCase'
import { UuidGenerator } from '../../types/UUIDGenerator'
import { DateGenerator } from '../../types/DateGenerator'
import { DuplicateEntityError } from '../../types/Errors'
import { User } from '../../entities'

type Params = {
  userRepository: UserRepository
  uuidGenerator: UuidGenerator
  dateGenerator: DateGenerator
}

type Request = {
  email: string
  password: string | null
}

export const createUserUsecase: UseCaseConstructor<Params, Request, User> = (params) => {
  const { userRepository, uuidGenerator, dateGenerator } = params

  return async (request) => {
    const { email, password } = request

    const user = await userRepository.getByEmail(email)

    if (user) {
      throw new DuplicateEntityError(`User with email ${user.email}`)
    }

    const NOW = dateGenerator.now()

    const newUser = {
      id: uuidGenerator.next(),
      email,
      password,
      createdAt: NOW,
      updatedAt: NOW,
    }

    await userRepository.save(newUser)

    return newUser
  }
}
