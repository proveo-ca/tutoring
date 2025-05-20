import { FastifyPluginAsync } from 'fastify'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const readFile = promisify(fs.readFile)

// Path to the reading directory
const READING_DIR = path.resolve(process.cwd(), 'reading')

const sources: FastifyPluginAsync = async (fastify): Promise<void> => {
  // GET /sources - List all available files
  fastify.get('/', async function () {
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
              lastModified: fileStat.mtime,
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
  fastify.get('/:filename', async function (request, reply) {
    const { filename } = request.params as { filename: string }
    
    try {
      const filePath = path.join(READING_DIR, filename)
      
      // Check if file exists
      try {
        await stat(filePath)
      } catch (error) {
        reply.code(404)
        return { error: 'File not found' }
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
      fastify.log.error(error)
      reply.code(500)
      return { error: 'Failed to download file' }
    }
  })
}

export default sources
