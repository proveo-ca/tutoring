import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import fastifyMultipart from '@fastify/multipart'
import post from './post.js'
import fs from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { BadRequestError } from '../../plugins/error-handler.js'

// Mock fs functions
vi.mock('node:fs', () => ({
  default: {
    readdir: vi.fn(),
    unlink: vi.fn(),
    mkdir: vi.fn(),
    exists: vi.fn()
  }
}))

// Mock stream/promises
vi.mock('node:stream/promises', () => ({
  pipeline: vi.fn()
}))

// Mock unzipper
vi.mock('unzipper', () => ({
  Extract: vi.fn(() => 'extract-stream')
}))

// Mock util.promisify
vi.mock('node:util', () => ({
  promisify: (fn: any) => fn
}))

describe('Sources POST Route', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify()
    await app.register(fastifyMultipart)
    await app.register(post)
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock exists to return true by default
    fs.exists.mockResolvedValue(true)
    
    // Mock readdir to return empty array by default
    fs.readdir.mockResolvedValue([])
    
    // Mock pipeline to succeed by default
    pipeline.mockResolvedValue(undefined)
  })

  afterEach(async () => {
    await app.close()
  })

  it('should handle zip file upload', async () => {
    // Mock the file method on request
    app.addHook('preHandler', (request, reply, done) => {
      request.file = async () => ({
        filename: 'test.zip',
        file: 'file-stream'
      })
      done()
    })

    const response = await app.inject({
      method: 'POST',
      url: '/',
      headers: {
        'content-type': 'multipart/form-data'
      }
    })

    expect(response.statusCode).toBe(200)
    
    const payload = JSON.parse(response.payload)
    expect(payload).toHaveProperty('success', true)
    expect(payload).toHaveProperty('message', 'Zip file uploaded and extracted successfully')
    
    // Verify pipeline was called with correct arguments
    expect(pipeline).toHaveBeenCalledWith('file-stream', 'extract-stream')
  })

  it('should return 400 when no file is uploaded', async () => {
    // Mock the file method to return null
    app.addHook('preHandler', (request, reply, done) => {
      request.file = async () => null
      done()
    })

    const response = await app.inject({
      method: 'POST',
      url: '/',
      headers: {
        'content-type': 'multipart/form-data'
      }
    })

    expect(response.statusCode).toBe(400)
    
    const payload = JSON.parse(response.payload)
    expect(payload.error).toHaveProperty('message', 'No file uploaded')
  })

  it('should return 400 when non-zip file is uploaded', async () => {
    // Mock the file method to return a non-zip file
    app.addHook('preHandler', (request, reply, done) => {
      request.file = async () => ({
        filename: 'test.txt',
        file: 'file-stream'
      })
      done()
    })

    const response = await app.inject({
      method: 'POST',
      url: '/',
      headers: {
        'content-type': 'multipart/form-data'
      }
    })

    expect(response.statusCode).toBe(400)
    
    const payload = JSON.parse(response.payload)
    expect(payload.error).toHaveProperty('message', 'Only zip files are supported')
  })

  it('should handle errors during directory cleaning', async () => {
    // Mock the file method
    app.addHook('preHandler', (request, reply, done) => {
      request.file = async () => ({
        filename: 'test.zip',
        file: 'file-stream'
      })
      done()
    })
    
    // Mock readdir to throw an error
    fs.readdir.mockRejectedValue(new Error('Failed to read directory'))

    const response = await app.inject({
      method: 'POST',
      url: '/',
      headers: {
        'content-type': 'multipart/form-data'
      }
    })

    expect(response.statusCode).toBe(500)
  })
})
