import { Request, Response } from 'express'
import { UnauthorizedError } from '../../domain/types/Errors'
import z from 'zod'
import {
  prismaBoardColumnRepository,
  prismaBoardRepository,
  prismaSubtaskRepository,
  prismaTaskRepository,
  prismaUserRepository,
} from '../repositories'
import { dateGenerator } from '../shared'
import { updateSubtaskUsecase } from '../../domain/usecases/updateSubtaskUsecase'
import { SubtaskStatus } from '../../domain/entities'
const subtaskData = z.object({
  description: z.string().min(1).max(280),
  status: z.enum(['in_progress', 'completed']),
})

export async function patchSubtaskController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User', 'modify subtask')
  }

  const { taskId, subtaskId } = req.params

  const { description, status } = subtaskData.parse(req.body)

  const updateSubtask = updateSubtaskUsecase({
    dateGenerator: dateGenerator,
    taskRepository: prismaTaskRepository,
    boardColumnRepository: prismaBoardColumnRepository,
    boardRepository: prismaBoardRepository,
    userRepository: prismaUserRepository,
    subtaskRepository: prismaSubtaskRepository,
  })

  await updateSubtask({
    userId,
    taskId: taskId!,
    subtaskId: subtaskId!,
    description,
    status: status as SubtaskStatus,
  })

  return res.status(204).json(null)
}
