import { Request, Response } from 'express'
import z from 'zod'
import {
  prismaBoardColumnRepository,
  prismaBoardRepository,
  prismaSubtaskRepository,
  prismaTaskRepository,
  prismaUserRepository,
} from '../repositories'
import { createUserUsecase } from '../../domain/usecases'
import { hashMethods, dateGenerator, uuidGenerator } from '../shared/'
import * as fs from 'fs'
import { ImportedBoards } from '../../domain/entities'
import { populateBoardsUsecase } from '../../domain/usecases/populateBoardsUsecase/populateBoardsUsecase'

const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export async function signUpUserController(req: Request, res: Response) {
  const { email, password } = userSchema.parse(req.body)

  const hashedPassword = await hashMethods.hash(password)

  const usecase = createUserUsecase({
    userRepository: prismaUserRepository,
    dateGenerator: dateGenerator,
    uuidGenerator: uuidGenerator,
  })

  const { email: sessionEmail, id } = await usecase({
    email: email,
    password: hashedPassword,
  })

  req.session.user = {
    email: sessionEmail,
    id,
  }
  await insertStarterBoards(id)

  res.status(201).json({
    message: 'Registration successful. Welcome to our platform!',
  })
}

export async function insertStarterBoards(userId: string) {
  const filePath = __dirname + '/starter-board.json'

  try {
    const data = fs.readFileSync(filePath, 'utf8')

    const importedBoards: ImportedBoards = JSON.parse(data)
    const populateBoards = populateBoardsUsecase({
      taskRepository: prismaTaskRepository,
      boardRepository: prismaBoardRepository,
      boardColumnRepository: prismaBoardColumnRepository,
      subtasksRepository: prismaSubtaskRepository,
      dateGenerator: dateGenerator,
      uuidGenerator: uuidGenerator,
    })
    await populateBoards({
      userId,
      importedBoards,
    })
  } catch (error) {
    console.error('Error reading or parsing the file:', error)
  }
}
