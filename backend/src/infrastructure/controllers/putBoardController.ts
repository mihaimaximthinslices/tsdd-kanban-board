import { Request, Response } from 'express'
import { UnauthorizedError } from '../../domain/types/Errors'
import z from 'zod'
import { prismaBoardColumnRepository, prismaBoardRepository, prismaUserRepository } from '../repositories'
import { dateGenerator, uuidGenerator } from '../shared'
import { updateBoardUsecase } from '../../domain/usecases'

const isUnique = (array: string[]) => new Set(array).size === array.length

const boardSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(25)
    .regex(/^[a-zA-Z\s]+$/),
  columns: z
    .array(
      z
        .string()
        .min(1)
        .max(25)
        .regex(/^[a-zA-Z\s]+$/),
    )
    .refine(isUnique, {
      message: 'Column names must be unique.',
    }),
  columnIds: z.array(z.string().uuid()).refine(isUnique, {
    message: 'Column ids must be unique.',
  }),
})
export async function putBoardController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User', 'post board')
  }
  const { boardId } = req.params

  const { name, columns, columnIds } = boardSchema.parse(req.body)

  const updateBoard = updateBoardUsecase({
    userRepository: prismaUserRepository,
    boardRepository: prismaBoardRepository,
    boardColumnRepository: prismaBoardColumnRepository,
    dateGenerator,
    uuidGenerator,
  })

  await updateBoard({ userId, boardId: boardId!, boardName: name, columnNames: columns, columnIds })

  return res.status(204).send(null)
}
