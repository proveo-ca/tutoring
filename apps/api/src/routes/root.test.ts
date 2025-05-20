import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import root from './root.js'

describe('Root Route', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify()
    await app.register(root)
  })

  afterEach(async () => {
    await app.close()
  })

  it('should return root info', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/'
    })

    expect(response.statusCode).toBe(200)
    
    const payload = JSON.parse(response.payload)
    expect(payload).toHaveProperty('root', true)
    expect(payload).toHaveProperty('version', '1.0.0')
  })
})
