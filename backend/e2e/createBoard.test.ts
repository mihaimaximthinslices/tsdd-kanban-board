import { describe, it } from 'vitest'
import app from '../app'
import request from 'supertest'

describe('POST /api/boards', () => {
  describe('given the request body does not have the right format', () => {
    const badRequests = [
      { name: 'Board Name' }, // Missing 'columns'
      { columns: ['Todo', 'Doing', 'Done'] }, // Missing 'name'
      { name: '', columns: [] }, // Empty 'name'
      { name: 'My Board', columns: ['', 'Todo'] }, // Empty 'column name'
      { name: 'My Board', columns: ['Todo', 'Todo'] }, // Non-unique columns
      { name: 'My Board', columns: [123, 'Doing'] }, // Invalid column type
      { name: 'My Board 123', columns: ['Todo', 'Doing'] }, // Invalid name, should only contain letters and spaces
      { name: 'My Board', columns: ['Todo12', 'Doing'] }, // Invalid column name, should only contain letters and spaces
      { name: 'My Board asdasdasdasd sjqw heqwhjegwqhjegwqhjegqwjheqgweh', columns: ['Todo', 'Doing'] }, // Name above 25 characters
      { name: 'My Board', columns: ['Toasdasdasdsawqeqwew3123123123123213123do', 'Doing', 'Done', 'Done'] }, // Column name above 25 characterw
    ]

    it.each(badRequests)('should return 400 status if %s', async (badRequest) => {
      await request(app).post('/api/boards').send(badRequest).expect(400)
    })
  })

  describe('given the request body has the right format', () => {
    const validRequest = {
      name: 'My Board',
      columns: ['Todo', 'Doing', 'Done'],
    }

    it('should return 201 status and create a board', async () => {
      await request(app).post('/api/boards').send(validRequest).expect(201)
    })
  })
})
