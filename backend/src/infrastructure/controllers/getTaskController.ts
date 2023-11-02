import { Request, Response } from 'express'
import { UnauthorizedError } from '../../domain/types/Errors'
import {
  prismaBoardColumnRepository,
  prismaBoardRepository,
  prismaTaskRepository,
  prismaUserRepository,
} from '../repositories'
import { getTaskUsecase } from '../../domain/usecases/getTaskUsecase'

export async function getTaskController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User')
  }

  const { taskId } = req.params

  const getTask = getTaskUsecase({
    taskRepository: prismaTaskRepository,
    userRepository: prismaUserRepository,
    boardRepository: prismaBoardRepository,
    boardColumnRepository: prismaBoardColumnRepository,
  })
  const task = await getTask({
    taskId: taskId!,
    userId,
  })

  return res.status(200).json(task)
}
