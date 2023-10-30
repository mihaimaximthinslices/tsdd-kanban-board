import { TaskRepository } from '../../domain/repositorties'
import { Task } from '../../domain/entities'

import { PrismaClient, Task as PrismaTask } from '@prisma/client'
const prisma = new PrismaClient()

export const prismaTaskRepository: TaskRepository = {
  async getById(id: string): Promise<Task | null> {
    const task = await prisma.task.findFirst({
      where: { id },
    })

    if (!task) {
      return null
    }

    return rowToEntity(task)
  },

  async getByColumnId(columnId: string): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: { columnId },
    })

    return tasks.map((task) => rowToEntity(task))
  },

  async save(task: Task): Promise<void> {
    const { id, ...taskData } = entityToRow(task)

    // Use upsert to insert or update the user based on their ID
    await prisma.task.upsert({
      where: { id },
      update: taskData,
      create: {
        id,
        ...taskData,
      },
    })
  },

  async delete(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id },
    })
  },
}

const rowToEntity = (row: PrismaTask): Task => {
  const { id, title, description, taskAfterId, taskBeforeId, columnId, createdAt, updatedAt } = row
  return {
    id,
    columnId,
    title,
    description,
    taskAfterId: taskAfterId || null,
    taskBeforeId: taskBeforeId || null,
    createdAt,
    updatedAt,
  }
}

const entityToRow = (entity: Task): PrismaTask => {
  const { id, title, description, taskAfterId, taskBeforeId, columnId, createdAt, updatedAt } = entity
  return {
    id,
    columnId,
    title,
    description,
    taskAfterId: taskAfterId || null,
    taskBeforeId: taskBeforeId || null,
    createdAt,
    updatedAt,
  }
}
