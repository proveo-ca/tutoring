import { FastifyPluginAsync } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'

const healthResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['ok', 'error'] },
    timestamp: { type: 'string', format: 'date-time' }
  },
  required: ['status', 'timestamp'],
  additionalProperties: false
} as const

type HealthResponse = FromSchema<typeof healthResponseSchema>

const health: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/', {
    schema: {
      response: {
        200: healthResponseSchema
      }
    }
  }, async function (): Promise<HealthResponse> {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  })
}

export default health
