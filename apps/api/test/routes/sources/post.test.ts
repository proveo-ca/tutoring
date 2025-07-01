import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import fastifyMultipart from '@fastify/multipart'
import post from "../../../src/routes/sources/post.js"

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
  })

  afterEach(async () => {
    await app.close()
  })

  it('should handle zip file upload', async () => {
  })

  it('should return 400 when no file is uploaded', async () => {
  })

  it('should return 400 when non-zip file is uploaded', async () => {
  })

  it('should handle errors during directory cleaning', async () => {
  })
})
