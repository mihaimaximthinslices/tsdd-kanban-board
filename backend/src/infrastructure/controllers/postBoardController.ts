import { Request, Response } from 'express'
import { UnauthorizedError } from '../../domain/types/Errors'
import z from 'zod'
import { createBoardUsecase, createBoardColumnUsecase } from '../../domain/usecases'
import { prismaBoardColumnRepository, prismaBoardRepository, prismaUserRepository } from '../repositories'
import { dateGenerator, uuidGenerator } from '../shared'

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
})
export async function postBoardController(req: Request, res: Response) {
  const userId = req.session.user?.id
  if (!userId) {
    throw new UnauthorizedError('User', 'post board')
  }
  const { name, columns } = boardSchema.parse(req.body)

  const createBoard = createBoardUsecase({
    boardRepository: prismaBoardRepository,
    userRepository: prismaUserRepository,
    uuidGenerator,
    dateGenerator,
  })

  const { id: boardId } = await createBoard({ userId, boardName: name })
  const columnIds: string[] = []
  if (columns.length > 0) {
    const createBoardColumn = createBoardColumnUsecase({
      boardColumnRepository: prismaBoardColumnRepository,
      boardRepository: prismaBoardRepository,
      userRepository: prismaUserRepository,
      uuidGenerator,
      dateGenerator,
    })
    for (let i = 0; i < columns.length; i++) {
      const columnName = columns[i]!
      const { id: columnId } = await createBoardColumn({ userId, boardId, columnName })
      columnIds.push(columnId)
    }
  }

  return res.status(201).json({ boardId, columnIds })
}
