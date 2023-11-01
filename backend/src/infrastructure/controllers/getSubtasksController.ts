import { Request, Response } from 'express'
import { UnauthorizedError } from '../../domain/types/Errors'
import {
  prismaBoardColumnRepository,
  prismaBoardRepository,
  prismaSubtaskRepository,
  prismaTaskRepository,
  prismaUserRepository,
} from '../repositories'
import { getSubtasksUsecase } from '../../domain/usecases/getSubtasksUsecase'

export async function getSubtasksController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User')
  }

  const { taskId } = req.params

  const getSubtasks = getSubtasksUsecase({
    subtaskRepository: prismaSubtaskRepository,
    taskRepository: prismaTaskRepository,
    userRepository: prismaUserRepository,
    boardRepository: prismaBoardRepository,
    boardColumnRepository: prismaBoardColumnRepository,
  })
  const subtasks = await getSubtasks({
    taskId: taskId!,
    userId,
  })

  return res.status(200).json(subtasks)
}
