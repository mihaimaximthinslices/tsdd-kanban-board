
import request from 'supertest'
import app from '../app'

import { describe, it, expect } from 'vitest'

describe('API', () => {
  it('should get hello world', async () => {
    const resp = await request(app).get('/api/hello')
    expect(resp.status).toEqual(200)
    expect(resp.body.message).toEqual('Hello World')
  })

})