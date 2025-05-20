import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import get from './get.js'
import fs from 'node:fs'
import path from 'node:path'
import { NotFoundError } from '../../plugins/error-handler.js'

// Mock fs functions
vi.mock('node:fs', () => ({
  default: {
    readdir: vi.fn(),
    stat: vi.fn(),
    readFile: vi.fn()
  }
}))

// Mock path functions
vi.mock('node:path', () => ({
  default: {
    join: vi.fn((dir, file) => `${dir}/${file}`),
    resolve: vi.fn(() => '/mocked/reading/path')
  }
}))

// Mock util.promisify
vi.mock('node:util', () => ({
  promisify: (fn: any) => fn
}))

describe('Sources GET Routes', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = Fastify()
    await app.register(get)
    
    // Reset mocks
    vi.clearAllMocks()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('GET /sources', () => {
    it('should return list of files', async () => {
      // Mock readdir to return some files
      fs.readdir.mockResolvedValue(['file1.md', 'file2.pdf', 'file3.txt'])
      
      // Mock stat to return file stats
      fs.stat.mockImplementation((filePath) => {
        return Promise.resolve({
          size: 1024,
          mtime: new Date('2023-01-01T00:00:00Z')
        })
      })

      const response = await app.inject({
        method: 'GET',
        url: '/'
      })

      expect(response.statusCode).toBe(200)
      
      const payload = JSON.parse(response.payload)
      expect(payload).toHaveProperty('files')
      expect(payload.files).toHaveLength(2) // Only .md and .pdf files
      
      // Check first file properties
      expect(payload.files[0]).toHaveProperty('filename', 'file1.md')
      expect(payload.files[0]).toHaveProperty('size', 1024)
      expect(payload.files[0]).toHaveProperty('lastModified')
      expect(payload.files[0]).toHaveProperty('downloadUrl', '/sources/file1.md')
    })

    it('should handle errors when listing files', async () => {
      // Mock readdir to throw an error
      fs.readdir.mockRejectedValue(new Error('Failed to read directory'))

      const response = await app.inject({
        method: 'GET',
        url: '/'
      })

      expect(response.statusCode).toBe(500)
    })
  })

  describe('GET /sources/:filename', () => {
    it('should return file content', async () => {
      // Mock stat to succeed
      fs.stat.mockResolvedValue({})
      
      // Mock readFile to return file content
      fs.readFile.mockResolvedValue(Buffer.from('file content'))

      const response = await app.inject({
        method: 'GET',
        url: '/file1.pdf'
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toBe('application/pdf')
      expect(response.headers['content-disposition']).toBe('attachment; filename="file1.pdf"')
      expect(response.payload).toBe('file content')
    })

    it('should return 404 when file not found', async () => {
      // Mock stat to throw an error
      fs.stat.mockRejectedValue(new Error('File not found'))

      const response = await app.inject({
        method: 'GET',
        url: '/nonexistent.pdf'
      })

      expect(response.statusCode).toBe(404)
    })
  })
})
