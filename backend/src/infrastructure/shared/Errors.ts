import { Request, Response } from 'express'
import {
  DuplicateEntityError,
  EntityNotFoundError,
  InvalidInputError,
  UnauthorizedError,
} from '../../domain/types/Errors'
import { ZodError } from 'zod'

export const withErrorHandling =
  (
    handler: (req: Request, res: Response) => Promise<void> | Promise<unknown>,
    errorHandler: (err: Error, res: Response) => void,
  ) =>
  async (req: Request, res: Response) => {
    try {
      await handler(req, res)
    } catch (err) {
      errorHandler(err as Error, res)
    }
  }
export const sharedErrorHandler = (err: Error, res: Response) => {
  if (err instanceof InvalidInputError) {
    res.status(400).json({ error: err.message })
  } else if (err instanceof EntityNotFoundError) {
    res.status(404).json({ error: err.message })
  } else if (err instanceof UnauthorizedError) {
    res.status(401).json({ error: err.message })
  } else if (err instanceof DuplicateEntityError) {
    res.status(409).json({ error: err.message })
  } else if (err instanceof ZodError) {
    res.status(400).json({
      errors: err.errors,
    })
  } else {
    console.log(err)
    res.status(500).json({ error: err.message })
  }
}
