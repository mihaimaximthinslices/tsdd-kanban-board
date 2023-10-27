import { Request, Response } from 'express'
import { UnauthorizedError } from '../../domain/types/Errors'
import { prismaBoardColumnRepository, prismaBoardRepository, prismaUserRepository } from '../repositories'
import { deleteBoardUsecase } from '../../domain/usecases'

export async function deleteBoardController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User', 'post board')
  }
  const { boardId } = req.params

  const deleteBoard = deleteBoardUsecase({
    userRepository: prismaUserRepository,
    boardRepository: prismaBoardRepository,
    boardColumnRepository: prismaBoardColumnRepository,
  })

  await deleteBoard({ userId, boardId: boardId! })

  return res.status(204).send(null)
}
