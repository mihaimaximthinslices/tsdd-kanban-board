import { Request, Response } from 'express'
import z from 'zod'
import { prismaUserRepository } from '../repositories'
import { hashMethods } from '../shared/'
import { UnauthorizedError } from '../../domain/types/Errors'

const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export async function signInUserController(req: Request, res: Response) {
  const { email, password } = userSchema.parse(req.body)

  const user = await prismaUserRepository.getByEmail(email)

  if (!user) {
    throw new UnauthorizedError('User')
  }

  if (!user.password) {
    return res.status(422).json({
      message: 'Account is registered for Google authentication',
    })
  }

  const hashMatch = await hashMethods.compare(password, user.password)

  if (!hashMatch) {
    throw new UnauthorizedError('User')
  }

  req.session.user = {
    email: user.email,
    id: user.id,
  }

  return res.status(200).json({
    message: 'Sign in successful!',
  })
}
