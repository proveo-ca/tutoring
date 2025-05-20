import { FastifyPluginAsync } from 'fastify'
import fastifyMultipart from '@fastify/multipart'

// Common schemas for sources routes
export const fileSchema = {
  type: 'object',
  properties: {
    filename: { type: 'string' },
    size: { type: 'number' },
    lastModified: { type: 'string', format: 'date-time' },
    downloadUrl: { type: 'string' }
  },
  required: ['filename', 'size', 'lastModified', 'downloadUrl'],
  additionalProperties: false
} as const

export const filesListSchema = {
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: fileSchema
    }
  },
  required: ['files'],
  additionalProperties: false
} as const

export const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' }
  },
  required: ['error'],
  additionalProperties: false
} as const

export const successSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' }
  },
  required: ['success', 'message'],
  additionalProperties: false
} as const

const sources: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Register multipart plugin to handle file uploads
  fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB limit
    }
  })
  
  // Register route handlers
  fastify.register(import('./get.js'))
  fastify.register(import('./post.js'))
}

export default sources
