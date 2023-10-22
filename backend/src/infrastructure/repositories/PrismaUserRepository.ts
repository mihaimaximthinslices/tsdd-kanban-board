import { UserRepository } from '../../domain/repositorties'
import { User } from '../../domain/entities'

import { PrismaClient, User as PrismaUser } from '@prisma/client'
const prisma = new PrismaClient()

export const prismaUserRepository: UserRepository = {
  async getByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { email },
    })
    if (!user) {
      return null
    }

    return rowToEntity(user)
  },

  async getById(id: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { id },
    })

    if (!user) {
      return null
    }

    return rowToEntity(user)
  },

  async save(user: User): Promise<void> {
    const { id, ...userData } = entityToRow(user)

    // Use upsert to insert or update the user based on their ID
    await prisma.user.upsert({
      where: { id },
      update: userData,
      create: {
        id,
        ...userData,
      },
    })
  },

  async delete(user: User): Promise<void> {
    const { id } = user
    await prisma.user.delete({
      where: { id },
    })
  },
}

const rowToEntity = (row: PrismaUser): User => {
  const { id, email, password, createdAt, updatedAt } = row
  return {
    id,
    email,
    password,
    createdAt,
    updatedAt,
  }
}

const entityToRow = (entity: User): PrismaUser => {
  const { id, email, password, createdAt, updatedAt } = entity
  return {
    id,
    email,
    password,
    createdAt,
    updatedAt,
  }
}
