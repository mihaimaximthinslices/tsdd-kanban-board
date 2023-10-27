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
      email: 'mihai.maxim+deleteBoardColumn@thinslices.com',
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
      } catch (_err) {
        /* empty */
      }
    })

    describe('given the request body has the right format', () => {
      it('should return 204 status and delete the board column', async () => {
        await request(app)
          .delete(`/api/boards/${testBoardId}/columns/${testColumnId1}`)
          .set('Cookie', [cookie])
          .expect(204)
      }, 5000)
    })
  })
})
