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
import { dateGenerator, uuidGenerator } from '../shared'
import { updateTaskUsecase } from '../../domain/usecases'

const isUnique = (array: string[]) => new Set(array).size === array.length

const boardSchema = z.object({
  title: z.string().min(1).max(280),
  description: z.string().max(10000),
  subtasks: z.array(z.string().min(1).max(280)).min(0),
  subtasksIds: z.array(z.string().uuid()).min(0).refine(isUnique, {
    message: 'Subtasks ids must be unique.',
  }),
  columnId: z.string().uuid(),
})

export async function putTaskController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User', 'put task')
  }
  const { taskId } = req.params

  const {
    subtasksIds,
    subtasks,
    title: taskTitle,
    description: taskDescription,
    columnId,
  } = boardSchema.parse(req.body)

  const updateTask = updateTaskUsecase({
    userRepository: prismaUserRepository,
    boardRepository: prismaBoardRepository,
    boardColumnRepository: prismaBoardColumnRepository,
    subtaskRepository: prismaSubtaskRepository,
    taskRepository: prismaTaskRepository,
    dateGenerator,
    uuidGenerator,
  })

  await updateTask({ userId, taskId: taskId!, taskTitle, taskDescription, subtasks, subtasksIds, columnId })

  return res.status(204).send(null)
}
