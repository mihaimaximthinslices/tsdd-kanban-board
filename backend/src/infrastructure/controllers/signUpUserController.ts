import { Request, Response } from 'express'
import z from 'zod'
import { prismaUserRepository } from '../repositories'
import { createUserUsecase } from '../../domain/usecases/createUserUsecase'
import { hashMethods, dateGenerator, uuidGenerator } from '../shared/'

const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export async function signUpUserController(req: Request, res: Response) {
  const { email, password } = userSchema.parse(req.body)

  const hashedPassword = await hashMethods.hash(password)

  const usecase = createUserUsecase({
    userRepository: prismaUserRepository,
    dateGenerator: dateGenerator,
    uuidGenerator: uuidGenerator,
  })

  const { email: sessionEmail, id } = await usecase({
    email: email,
    password: hashedPassword,
  })

  req.session.user = {
    email: sessionEmail,
    id,
  }

  res.status(201).json({
    message: 'Registration successful. Welcome to our platform!',
  })
}
