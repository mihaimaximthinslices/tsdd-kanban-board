import { Request, Response } from 'express'
import { UnauthorizedError } from '../../domain/types/Errors'
import {
  prismaBoardColumnRepository,
  prismaBoardRepository,
  prismaTaskRepository,
  prismaUserRepository,
} from '../repositories'
import { getColumnTasksUsecase } from '../../domain/usecases'

export async function getColumnTasksController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User')
  }

  const { boardId, columnId } = req.params

  console.log(boardId, columnId)

  const getColumnTasks = getColumnTasksUsecase({
    boardRepository: prismaBoardRepository,
    boardColumnRepository: prismaBoardColumnRepository,
    taskRepository: prismaTaskRepository,
    userRepository: prismaUserRepository,
  })

  const tasks = await getColumnTasks({
    columnId: columnId!,
    boardId: boardId!,
    userId,
  })

  return res.status(200).json(tasks)
}
