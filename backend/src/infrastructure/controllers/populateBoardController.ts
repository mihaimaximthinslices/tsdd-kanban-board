import { Request, Response } from 'express'
import { DuplicateEntityError, UnauthorizedError } from '../../domain/types/Errors'
import { insertStarterBoards } from './signUpUserController'
import { prismaBoardRepository } from '../repositories'

export async function populateBoardController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User', 'move task')
  }

  const boards = await prismaBoardRepository.getByUserId(userId)

  console.log(boards)

  if (boards.length > 0) {
    throw new DuplicateEntityError('populate')
  }

  await insertStarterBoards(userId)

  return res.status(200).json({
    message: 'Enjoy the app!',
  })
}
