import { UnauthorizedError } from '../../domain/types/Errors'
import { Request, Response } from 'express'
import { prismaBoardRepository } from '../repositories'

export async function getBoardsController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User', 'post board')
  }

  const boards = await prismaBoardRepository.getByUserId(userId)

  return res.status(200).json({ boards })
}
