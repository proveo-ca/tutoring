import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import health from '../../src/routes/health/index.js'

describe('Health Route', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify()
    await app.register(health)
  })

  afterEach(async () => {
    await app.close()
  })

  it('should return health status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/'
    })

    expect(response.statusCode).toBe(200)

    const payload = JSON.parse(response.payload)
    expect(payload).toHaveProperty('status', 'ok')
    expect(payload).toHaveProperty('timestamp')

    // Verify timestamp is a valid ISO date string
    expect(() => new Date(payload.timestamp)).not.toThrow()
  })
})
