import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../app'
import request from 'supertest'
import { prismaBoardRepository, prismaUserRepository } from '../src/infrastructure/repositories'

let cookie = ''
describe('POST /api/boards', () => {
  describe('given the user is authenticated', () => {
    const credentials = {
      email: 'mihai.maxim+createBoard@thinslices.com',
      password: 'password1234',
    }
    beforeAll(async () => {
      //delete old boards

      const user = await prismaUserRepository.getByEmail(credentials.email)

      const boards = await prismaBoardRepository.getByUserId(user!.id)

      if (boards)
        for (let i = 0; i < boards!.length; i++) {
          await prismaBoardRepository.delete(boards![i]!.id)
        }

      const response = await request(app).post('/api/sign-in').send(credentials).expect(200)
      expect(response.headers['set-cookie']).toBeDefined()
      cookie = response.headers['set-cookie']
    })

    afterAll(async () => {
      const user = await prismaUserRepository.getByEmail(credentials.email)

      const boards = await prismaBoardRepository.getByUserId(user!.id)

      try {
        if (boards)
          for (let i = 0; i < boards!.length; i++) {
            await prismaBoardRepository.delete(boards![i]!.id)
          }
      } catch (err) {
        //empty
      }
    })

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
        await request(app).post('/api/boards').set('Cookie', [cookie]).send(badRequest).expect(400)
      })
    })

    describe('given the request body has the right format', () => {
      const validRequest = {
        name: 'My Board',
        columns: ['Todo', 'Doing', 'Done'],
      }

      it('should return 201 status and create a board', async () => {
        await request(app).post('/api/boards').set('Cookie', [cookie]).send(validRequest).expect(201)
      })

      it('should return 409 status if I try to create the same board again (same board name)', async () => {
        await request(app).post('/api/boards').set('Cookie', [cookie]).send(validRequest).expect(409)
      })
    })
  })
})
