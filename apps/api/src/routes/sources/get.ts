import fs from 'node:fs'
import path from 'node:path'
import { FastifyPluginAsync } from 'fastify'
import { promisify } from 'node:util'
import { FromSchema } from 'json-schema-to-ts'
import { filesListSchema, errorSchema } from './index.js'
import { NotFoundError } from '../../plugins/error-handler.js'

const __dirname = import.meta.dirname;
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const readFile = promisify(fs.readFile)

// Path to the reading directory
const READING_DIR = process.env.DOCS_URL || path.resolve(__dirname, '..', '..', '..', '..', '..', 'reading');

// Parameter schema for filename
const filenameParamSchema = {
  type: 'object',
  properties: {
    filename: { type: 'string' }
  },
  required: ['filename']
} as const

type FilenameParam = FromSchema<typeof filenameParamSchema>

const get: FastifyPluginAsync = async (fastify): Promise<void> => {
  // GET /sources - List all available files
  fastify.get('/', {
    schema: {
      response: {
        200: filesListSchema,
        500: errorSchema
      }
    }
  }, async function () {
    try {
      const files = await readdir(READING_DIR)
      const fileList = await Promise.all(
        files
          .filter(file => file.endsWith('.md') || file.endsWith('.pdf'))
          .map(async (file) => {
            const filePath = path.join(READING_DIR, file)
            const fileStat = await stat(filePath)
            return {
              filename: file,
              size: fileStat.size,
              lastModified: fileStat.mtime.toISOString(),
              downloadUrl: `/sources/${file}`
            }
          })
      )

      return { files: fileList }
    } catch (error) {
      fastify.log.error(error)
      throw new Error('Failed to list source files')
    }
  })

  // GET /sources/:filename - Download a specific file
  fastify.get<{ Params: FilenameParam }>('/:filename', {
    schema: {
      params: filenameParamSchema,
      response: {
        404: errorSchema,
        500: errorSchema
      }
    }
  }, async function (request, reply) {
    const { filename } = request.params

    try {
      const filePath = path.join(READING_DIR, filename)

      // Check if file exists
      try {
        await stat(filePath)
      } catch (error) {
        throw new NotFoundError('File not found')
      }

      // Determine content type
      let contentType = 'application/octet-stream'
      if (filename.endsWith('.pdf')) {
        contentType = 'application/pdf'
      } else if (filename.endsWith('.md')) {
        contentType = 'text/markdown'
      }

      const fileContent = await readFile(filePath)

      reply
        .header('Content-Type', contentType)
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .send(fileContent)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      fastify.log.error(error)
      throw new Error('Failed to download file')
    }
  })
}

export default get
