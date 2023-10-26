import { EntityNotFoundError, UnauthorizedError } from '../../domain/types/Errors'
import { Request, Response } from 'express'
import { prismaBoardColumnRepository, prismaBoardRepository } from '../repositories'

export async function getBoardCollumnsController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User', 'post board')
  }

  const { boardId } = req.params

  const board = await prismaBoardRepository.getById(boardId!)

  if (!board) {
    throw new EntityNotFoundError(boardId!)
  }

  if (board.userId !== userId) {
    throw new UnauthorizedError(userId, boardId)
  }

  const columns = await prismaBoardColumnRepository.getByBoardId(boardId!)

  return res.status(200).json({ columns })
}
