import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import errorHandler, { AppError, NotFoundError, BadRequestError, UnauthorizedError } from './error-handler.js'

describe('Error Handler Plugin', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify()
    await app.register(errorHandler)
    
    // Add a test route that throws different errors
    app.get('/app-error', () => {
      throw new AppError('Custom app error', 500, 'CUSTOM_ERROR')
    })
    
    app.get('/not-found', () => {
      throw new NotFoundError('Resource not found')
    })
    
    app.get('/bad-request', () => {
      throw new BadRequestError('Invalid input')
    })
    
    app.get('/unauthorized', () => {
      throw new UnauthorizedError('Not authenticated')
    })
    
    app.get('/generic-error', () => {
      throw new Error('Generic error')
    })
    
    // Add a route with schema validation
    app.get('/validation', {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            id: { type: 'number' }
          },
          required: ['id']
        }
      }
    }, (request) => {
      return { success: true }
    })
  })

  afterEach(async () => {
    await app.close()
  })

  it('should handle AppError correctly', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/app-error'
    })

    expect(response.statusCode).toBe(500)
    
    const payload = JSON.parse(response.payload)
    expect(payload.error).toHaveProperty('code', 'CUSTOM_ERROR')
    expect(payload.error).toHaveProperty('message', 'Custom app error')
  })

  it('should handle NotFoundError correctly', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/not-found'
    })

    expect(response.statusCode).toBe(404)
    
    const payload = JSON.parse(response.payload)
    expect(payload.error).toHaveProperty('code', 'NOT_FOUND')
    expect(payload.error).toHaveProperty('message', 'Resource not found')
  })

  it('should handle BadRequestError correctly', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/bad-request'
    })

    expect(response.statusCode).toBe(400)
    
    const payload = JSON.parse(response.payload)
    expect(payload.error).toHaveProperty('code', 'BAD_REQUEST')
    expect(payload.error).toHaveProperty('message', 'Invalid input')
  })

  it('should handle UnauthorizedError correctly', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/unauthorized'
    })

    expect(response.statusCode).toBe(401)
    
    const payload = JSON.parse(response.payload)
    expect(payload.error).toHaveProperty('code', 'UNAUTHORIZED')
    expect(payload.error).toHaveProperty('message', 'Not authenticated')
  })

  it('should handle generic errors correctly', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/generic-error'
    })

    expect(response.statusCode).toBe(500)
    
    const payload = JSON.parse(response.payload)
    expect(payload.error).toHaveProperty('code', 'INTERNAL_SERVER_ERROR')
  })

  it('should handle validation errors correctly', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/validation?id=abc' // Invalid type for id
    })

    expect(response.statusCode).toBe(400)
    
    const payload = JSON.parse(response.payload)
    expect(payload.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })
})
