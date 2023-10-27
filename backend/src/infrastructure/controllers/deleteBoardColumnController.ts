import { Request, Response } from 'express'
import { UnauthorizedError } from '../../domain/types/Errors'
import { prismaBoardColumnRepository, prismaBoardRepository, prismaUserRepository } from '../repositories'
import { deleteBoardColumnUsecase } from '../../domain/usecases'

export async function deleteBoardColumnController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User', 'post board')
  }
  const { boardId, columnId } = req.params

  const deleteBoardColum = deleteBoardColumnUsecase({
    userRepository: prismaUserRepository,
    boardRepository: prismaBoardRepository,
    boardColumnRepository: prismaBoardColumnRepository,
  })

  await deleteBoardColum({ userId, boardId: boardId!, columnId: columnId! })

  return res.status(204).send(null)
}
