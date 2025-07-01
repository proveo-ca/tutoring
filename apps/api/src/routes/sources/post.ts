import fs from 'node:fs'
import path from 'node:path'
import { FastifyPluginAsync } from 'fastify'
import { promisify } from 'node:util'
import { pipeline } from 'node:stream/promises'
import { Extract } from 'unzipper'
import { successSchema, errorSchema } from './index.js'
import { BadRequestError } from '../../plugins/error-handler.js'

const __dirname = import.meta.dirname;
const readdir = promisify(fs.readdir)
const unlink = promisify(fs.unlink)
const mkdir = promisify(fs.mkdir)
const exists = promisify(fs.exists)

// Path to the reading directory
const READING_DIR = process.env.DOCS_URL || path.resolve(__dirname, '..', '..', '..', '..', '..', 'reading');

// Clean directory by removing all files
async function cleanDirectory(dirPath: string): Promise<void> {
  try {
    // Check if directory exists
    if (!(await exists(dirPath))) {
      await mkdir(dirPath, { recursive: true });
      return;
    }

    const files = await readdir(dirPath);

    // Delete all files in the directory
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      await unlink(filePath);
    }
  } catch (error) {
    console.error('Error cleaning directory:', error);
    throw new Error('Failed to clean directory');
  }
}

const post: FastifyPluginAsync = async (fastify): Promise<void> => {
  // POST /sources - Upload a zip file
  fastify.post('/', {
    schema: {
      response: {
        200: successSchema,
        400: errorSchema,
        500: errorSchema
      }
    }
  }, async function (request, reply) {
    try {
      const data = await request.file();

      if (!data) {
        throw new BadRequestError('No file uploaded');
      }

      if (!data.filename.endsWith('.zip')) {
        throw new BadRequestError('Only zip files are supported');
      }

      // Clean the reading directory
      await cleanDirectory(READING_DIR);

      // Extract the zip file to the reading directory
      await pipeline(
        data.file,
        Extract({ path: READING_DIR })
      );

      return { success: true, message: 'Zip file uploaded and extracted successfully' };
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      fastify.log.error(error);
      throw new Error('Failed to process the uploaded file');
    }
  });
}

export default post
