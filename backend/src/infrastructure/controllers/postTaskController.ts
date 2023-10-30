import { UnauthorizedError } from '../../domain/types/Errors'
import { Request, Response } from 'express'
import z from 'zod'
import { createTaskUsecase } from '../../domain/usecases/createTaskUsecase'
import {
  prismaBoardColumnRepository,
  prismaBoardRepository,
  prismaUserRepository,
  prismaTaskRepository,
  prismaSubtaskRepository,
} from '../repositories'
import { dateGenerator, uuidGenerator } from '../shared'

const newTaskSchema = z.object({
  title: z.string().min(1).max(280),
  description: z.string().max(10000),
  subtasks: z.array(z.string().min(1).max(280)).optional(),
})
export async function postTaskController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User', 'post board')
  }

  const { columnId } = req.params

  const { title, description, subtasks } = newTaskSchema.parse(req.body)

  const createTask = createTaskUsecase({
    taskRepository: prismaTaskRepository,
    boardRepository: prismaBoardRepository,
    boardColumnRepository: prismaBoardColumnRepository,
    subtaskRepository: prismaSubtaskRepository,
    userRepository: prismaUserRepository,
    dateGenerator,
    uuidGenerator,
  })

  await createTask({
    userId,
    columnId: columnId as string,
    title,
    description,
    subtasks: subtasks ?? [],
  })

  res.status(204).json(null)
}
