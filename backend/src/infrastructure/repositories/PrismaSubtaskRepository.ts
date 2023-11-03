import { SubtaskRepository } from '../../domain/repositorties'
import { Subtask, SubtaskStatus } from '../../domain/entities'

import { Subtask as PrismaSubtask } from '@prisma/client'

import prisma from './prismaConnection'

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
      orderBy: { createdAt: 'asc' },
    })

    return subtasks.map((subtask) => rowToEntity(subtask))
  },

  async save(subtask: Subtask): Promise<void> {
    const { id, ...subtaskData } = entityToRow(subtask)

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
