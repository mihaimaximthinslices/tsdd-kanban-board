import { Request, Response } from 'express'
import { UnauthorizedError } from '../../domain/types/Errors'
import {
  prismaBoardColumnRepository,
  prismaBoardRepository,
  prismaSubtaskRepository,
  prismaTaskRepository,
  prismaUserRepository,
} from '../repositories'
import { deleteTaskUsecase } from '../../domain/usecases/deleteTaskUsecase'
import { dateGenerator } from '../shared'

export async function deleteTaskController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User', 'delete task')
  }
  const { taskId } = req.params

  const deleteTask = deleteTaskUsecase({
    userRepository: prismaUserRepository,
    boardRepository: prismaBoardRepository,
    boardColumnRepository: prismaBoardColumnRepository,
    taskRepository: prismaTaskRepository,
    subtaskRepository: prismaSubtaskRepository,
    dateGenerator: dateGenerator,
  })

  await deleteTask({ userId, taskId: taskId! })

  return res.status(204).send(null)
}
