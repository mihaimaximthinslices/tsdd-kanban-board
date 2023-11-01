import { faker } from '@faker-js/faker'
import { Subtask, SubtaskStatus } from '../../domain/entities'

export const subtaskBuilder = {
  build: (partialSubtask?: Partial<Subtask>) => {
    let newSubtask: Subtask = {
      id: faker.string.uuid(),
      taskId: faker.string.uuid(),
      description: faker.lorem.paragraph(),
      status: SubtaskStatus.in_progress,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (partialSubtask) {
      newSubtask = {
        ...newSubtask,
        ...partialSubtask,
      }
    }
    return newSubtask
  },
  buildMany: (count: number, partialSubtask?: Partial<Subtask>) => {
    const subtasks: Subtask[] = []
    for (let i = 0; i < count; i++) {
      let newSubtask: Subtask = {
        id: faker.string.uuid(),
        taskId: faker.string.uuid(),
        description: faker.lorem.paragraph(),
        status: SubtaskStatus.in_progress,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      if (partialSubtask) {
        newSubtask = {
          ...newSubtask,
          ...partialSubtask,
        }
      }
      subtasks.push(newSubtask)
    }
    return subtasks
  },
}
