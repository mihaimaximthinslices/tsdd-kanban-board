import { Request, Response } from 'express'
import { UnauthorizedError } from '../../domain/types/Errors'
import z from 'zod'
import {
  prismaBoardColumnRepository,
  prismaBoardRepository,
  prismaTaskRepository,
  prismaUserRepository,
} from '../repositories'
import { dateGenerator } from '../shared'
import { moveTaskUsecase } from '../../domain/usecases/moveTaskUsecase/moveTaskUsecase'
const moveCommand = z.object({
  taskId: z.string().uuid(),
  to: z.object({
    columnId: z.string().uuid(),
    afterTaskId: z.string().uuid().nullable(),
  }),
})

export async function patchTaskGroupingController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User', 'move task')
  }
  const { taskId, to } = moveCommand.parse(req.body)

  const moveTask = moveTaskUsecase({
    dateGenerator: dateGenerator,
    taskRepository: prismaTaskRepository,
    boardColumnRepository: prismaBoardColumnRepository,
    boardRepository: prismaBoardRepository,
    userRepository: prismaUserRepository,
  })

  await moveTask({
    userId,
    taskId,
    to,
  })

  return res.status(204).json(null)
}
