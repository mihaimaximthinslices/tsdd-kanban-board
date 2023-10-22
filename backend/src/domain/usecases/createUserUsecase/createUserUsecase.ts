import { UserRepository } from '../../repositorties'
import { UseCaseConstructor } from '../../types/UseCase'
import { User } from '../../entities'
import { UuidGenerator } from '../../types/UUIDGenerator'
import { DateGenerator } from '../../types/DateGenerator'
import { DuplicateEntityError } from '../../types/Errors'

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

    if (user && user.password) {
      throw new DuplicateEntityError(`User with email ${user.email}`)
    }

    const newUser: Partial<User> = { ...user }

    const NOW = dateGenerator.now()

    if (!user) {
      newUser.id = uuidGenerator.next()
      newUser.email = email
      newUser.password = password
      newUser.createdAt = NOW
      newUser.updatedAt = NOW
    }

    if (!user?.password) {
      newUser.password = password
      newUser.updatedAt = NOW
    }

    await userRepository.save(newUser as User)

    return newUser as User
  }
}
