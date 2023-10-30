import { faker } from '@faker-js/faker'
import { Task } from '../../domain/entities'
export const taskBuilder = {
  build: (partialTask?: Partial<Task>) => {
    let newTask: Task = {
      id: faker.string.uuid(),
      taskBeforeId: faker.string.uuid(),
      taskAfterId: faker.string.uuid(),
      columnId: faker.string.uuid(),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (partialTask) {
      newTask = {
        ...newTask,
        ...partialTask,
      }
    }
    return newTask
  },
  buildMany: (count: number, partialTask?: Partial<Task>) => {
    const tasks: Task[] = []
    for (let i = 0; i < count; i++) {
      let newTask: Task = {
        id: faker.string.uuid(),
        taskBeforeId: faker.string.uuid(),
        taskAfterId: faker.string.uuid(),
        columnId: faker.string.uuid(),
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      if (partialTask) {
        newTask = {
          ...newTask,
          ...partialTask,
        }
      }
      tasks.push(newTask)
    }
    return tasks
  },
}
