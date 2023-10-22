import { expect, describe, it, beforeEach, beforeAll } from 'vitest'
import app from '../app'
import request from 'supertest'
import { prismaUserRepository } from '../src/infrastructure/repositories'

describe('POST /api/sign-up', () => {
  beforeAll(async () => {
    //clear any old users
    const oldUser = await prismaUserRepository.getByEmail('mihai.maximfii@gmail.com')

    if (oldUser) {
      await prismaUserRepository.delete(oldUser)
    }
  })

  describe('given the credentials do not have the right format', () => {
    const badCredentialsMissingPassword = {
      email: 'mihai.maxim@thinslices.com',
    }
    const badCredentialsMissingEmail = {
      password: 'password1234',
    }
    const badCredentialsMissingEmailAndPassword = {}

    const badCredentialsInvalidEmailAddressFormat = {
      email: 'this is not an email',
      password: 'password1234',
    }

    const badCredentialsShortPassword = {
      email: 'mihai.maxim@thinslices.com',
      password: '1234',
    }

    const badCredentialsInvalidTypes = {
      email: 123,
      password: 123,
    }

    const badCredentials = [
      badCredentialsMissingPassword,
      badCredentialsMissingEmail,
      badCredentialsMissingEmailAndPassword,
      badCredentialsInvalidEmailAddressFormat,
      badCredentialsShortPassword,
      badCredentialsInvalidTypes,
    ]

    it.each(badCredentials)('should return 400 status if %s', async (badCredential) => {
      await request(app).post('/api/sign-up').send(badCredential).expect(400)
    })
  })

  describe('given the credentials have the right format', () => {
    const credentials = {
      email: 'mihai.maxim@thinslices.com',
      password: 'password1234',
    }

    describe('given the email is already in use', () => {
      it('should return 409 status', async () => {
        await request(app).post('/api/sign-up').send(credentials).expect(409)
      })
    })

    describe('given the email is not already in use', () => {
      beforeEach(() => {
        credentials.email = 'mihai.maximfii@gmail.com'
      })

      it('should return 201 status with a token (in response body and in set-cookie header)', async () => {
        const response = await request(app).post('/api/sign-up').send(credentials).expect(201)
        expect(response.headers['set-cookie']).toBeDefined()
      })
    })
  })
})
