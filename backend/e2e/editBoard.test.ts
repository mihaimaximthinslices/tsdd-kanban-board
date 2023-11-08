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
let testColumnId1 = ''
const testColumnName1 = 'columnOne'
let testColumnId2 = ''
const testColumnName2 = 'columnTwo'

let requestData = {}
describe('PUT /api/boards/:boardId', () => {
  describe('given the user is authenticated', () => {
    const credentials = {
      email: 'mihai.maxim+updateBoard@thinslices.com',
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
        let newColumn = boardColumnBuilder.build({
          columnName: testColumnName1,
          boardId: newBoard.id,
        })

        testColumnId1 = newColumn.id

        await prismaBoardColumnRepository.save(newColumn)

        newColumn = boardColumnBuilder.build({
          columnName: testColumnName2,
          boardId: newBoard.id,
        })

        await prismaBoardColumnRepository.save(newColumn)

        testColumnId2 = newColumn.id
      })
      requestData = {
        name: testBoardName + ' new',
        columns: [testColumnName1 + ' new', testColumnName2 + ' new', 'columnThree new'],
        columnIds: [testColumnId1, testColumnId2],
      }

      const response = await request(app).post('/api/sign-in').send(credentials).expect(200)
      expect(response.headers['set-cookie']).toBeDefined()
      cookie = response.headers['set-cookie']
    })

    afterAll(async () => {
      try {
        await prismaBoardRepository.delete(testBoardId)

        await prismaBoardColumnRepository.delete(testColumnId1)

        await prismaBoardColumnRepository.delete(testColumnId2)
      } catch (_err) {
        /* empty */
      }
    })

    describe('given the request body does not have the right format', () => {
      const badRequests = [
        { name: 'Board Name', columnIds: [testColumnId1, testColumnId2] }, // Missing 'columns'
        { columns: ['Todo', 'Doing'], columnIds: [testColumnId1, testColumnId2] }, // Missing 'name'
        { name: '', columns: [], columnIds: [] }, // Empty 'name'
        { name: 'My Board', columns: ['', 'Todo'], columnIds: [testColumnId1, testColumnId2] }, // Empty 'column name'
        { name: 'My Board', columns: ['Todo', 'Todo'], columnIds: [testColumnId1, testColumnId2] }, // Non-unique columns
        { name: 'My Board', columns: [123, 'Doing'], columnIds: [testColumnId1, testColumnId2] }, // Invalid column type
        { name: 'My Board', columns: ['Todo12', 'Doing'], columnIds: [testColumnId1, testColumnId2] }, // Invalid column name, should only contain letters and spaces
        {
          name: 'My Board asdasdasdasd sjqw heqwhjegwqhjegwqhjegqwjheqgweh',
          columns: ['Todo', 'Doing'],
          columnIds: [testColumnId1, testColumnId2],
        },
        {
          name: 'My Board',
          columns: ['Toasdasdasdsawqeqwew3123123123123213123do', 'Doing'],
          columnIds: [testColumnId1, testColumnId2],
        },
        { name: 'My Board', columns: ['Todo', 'Doing'] }, // missing column ids
        { name: 'My Board', columns: ['Todo', 'Doing'], columnIds: [testColumnId1, testColumnId1] }, // non unique columnIds
        {
          name: 'My Board',
          columns: ['Todo', 'Doing'],
          columnIds: ['testColumnId1testColumnId1testColumnId1testColumnId1testColumnId1testColumnId1', testColumnId1],
        },
      ]

      it.each(badRequests)('should return 400 status if %s', async (badReq) => {
        await request(app).put(`/api/boards/${testBoardId}`).set('Cookie', [cookie]).send(badReq).expect(400)
      })
    })

    describe('given the request body has the right format', () => {
      it('should return 204 status and update the board', async () => {
        await request(app).put(`/api/boards/${testBoardId}`).set('Cookie', [cookie]).send(requestData).expect(204)
      }, 5000)
    })
  })
})
