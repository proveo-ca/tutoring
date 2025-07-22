import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

// Define custom error class
export class AppError extends Error {
  statusCode: number
  code: string

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}

// Define specific error types
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400, 'BAD_REQUEST')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

const errorHandler: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.setErrorHandler((error, request, reply) => {
    // Handle AppError instances
    if (error instanceof AppError) {
      fastify.log.error({
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
        path: request.url,
        method: request.method
      })

      return reply
        .status(error.statusCode)
        .send({
          error: {
            code: error.code,
            message: error.message
          }
        })
    }

    // Handle validation errors from Fastify
    if (error.validation) {
      const validationError = error.validation[0]
      
      fastify.log.error({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: `${validationError.instancePath} ${validationError.message}`,
        path: request.url,
        method: request.method
      })

      return reply
        .status(400)
        .send({
          error: {
            code: 'VALIDATION_ERROR',
            message: `${validationError.instancePath} ${validationError.message}`
          }
        })
    }

    // Handle all other errors
    fastify.log.error(error)
    
    // Don't expose internal errors in production
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error'
      : error.message

    return reply
      .status(500)
      .send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message
        }
      })
  })
}

export default fp(errorHandler)
