import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../app'
import request from 'supertest'
import {
  prismaBoardColumnRepository,
  prismaBoardRepository,
  prismaUserRepository,
} from '../src/infrastructure/repositories'
import { boardBuilder } from '../src/infrastructure/shared'
import { boardColumnBuilder } from '../src/infrastructure/shared/BoardColumnBuilder'

let cookie = ''

let testBoardId = ''
const testBoardName = 'boardName'
const testColumnName1 = 'columnOne'
let testColumnId1 = ''

describe('DELETE /api/boards/:boardId/:columnId', () => {
  describe('given the user is authenticated', () => {
    const credentials = {
      email: 'mihai.maxim+postTask@thinslices.com',
      password: 'password1234',
    }
    beforeAll(async () => {
      //delete old boards

      const user = await prismaUserRepository.getByEmail(credentials.email)

      const newBoard = boardBuilder.build({
        userId: user!.id,
        boardName: testBoardName,
      })

      testBoardId = newBoard.id

      await prismaBoardRepository.save(newBoard).then(async () => {
        const newColumn = boardColumnBuilder.build({
          columnName: testColumnName1,
          boardId: newBoard.id,
        })

        await prismaBoardColumnRepository.save(newColumn)

        testColumnId1 = newColumn.id
      })

      const response = await request(app).post('/api/sign-in').send(credentials).expect(200)
      expect(response.headers['set-cookie']).toBeDefined()
      cookie = response.headers['set-cookie']
    })

    afterAll(async () => {
      try {
        await prismaBoardRepository.delete(testBoardId)
        await prismaBoardColumnRepository.delete(testColumnId1)
      } catch (_err) {
        /* empty */
      }
    })

    describe('given the request body does not have the right format', () => {
      const badRequests = [
        {
          description: 'my description',
          subtasks: ['sub 1', 'sub 2'],
        }, //missing title
        {
          title: '',
          description: 'my description',
          subtasks: ['sub 1', 'sub 2'],
        }, // empty title
        {
          title: 'my title',
          subtasks: ['sub 1', 'sub 2'],
        }, // missing description
        {
          title: 21312,
          description: 432432,
          subtasks: ['sub 1', 'sub 2'],
        }, // wrong types for title or description
        {
          title: 'my title',
          description: 'my description',
          subtasks: [21312, 'sub 2'], // wrong types for subtasks
        },
      ]

      it.each(badRequests)('should return 400 status if %s', async (badRequest) => {
        await request(app)
          .post(`/api/boards/${testBoardId}/columns/${testColumnId1}/tasks`)
          .set('Cookie', [cookie])
          .send(badRequest)
          .expect(400)
      })
    })

    describe('given the request body has the right format', () => {
      const validRequest = {
        columnId: testColumnId1,
        title: 'my title',
        description: 'my description',
        subtasks: ['sub 1', 'sub 2'],
      }
      it('should return 204 and create the task and subtasks', async () => {
        await request(app)
          .post(`/api/boards/${testBoardId}/columns/${testColumnId1}/tasks`)
          .set('Cookie', [cookie])
          .send(validRequest)
          .expect(204)
      }, 5000)
    })
  })
})
