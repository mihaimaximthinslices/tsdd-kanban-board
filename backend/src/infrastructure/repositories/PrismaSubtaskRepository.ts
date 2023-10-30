import { SubtaskRepository } from '../../domain/repositorties'
import { Subtask, SubtaskStatus } from '../../domain/entities'

import { PrismaClient, Subtask as PrismaSubtask } from '@prisma/client'
const prisma = new PrismaClient()

export const prismaSubtaskRepository: SubtaskRepository = {
  async getById(id: string): Promise<Subtask | null> {
    const subtask = await prisma.subtask.findFirst({
      where: { id },
    })

    if (!subtask) {
      return null
    }

    return rowToEntity(subtask)
  },

  async getByTaskId(taskId: string): Promise<Subtask[]> {
    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
    })

    return subtasks.map((subtask) => rowToEntity(subtask))
  },

  async save(subtask: Subtask): Promise<void> {
    const { id, ...subtaskData } = entityToRow(subtask)

    // Use upsert to insert or update the user based on their ID
    await prisma.subtask.upsert({
      where: { id },
      update: subtaskData,
      create: {
        id,
        ...subtaskData,
      },
    })
  },

  async delete(id: string): Promise<void> {
    await prisma.subtask.delete({
      where: { id },
    })
  },
}

const rowToEntity = (row: PrismaSubtask): Subtask => {
  const { id, description, taskId, createdAt, updatedAt, status } = row
  return {
    id,
    taskId,
    description,
    status: status as SubtaskStatus,
    createdAt,
    updatedAt,
  }
}

const entityToRow = (entity: Subtask): PrismaSubtask => {
  const { id, description, taskId, createdAt, updatedAt, status } = entity
  return {
    id,
    taskId,
    status,
    description,
    createdAt,
    updatedAt,
  }
}
