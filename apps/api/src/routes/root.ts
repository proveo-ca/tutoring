import { FastifyPluginAsync } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'

const rootResponseSchema = {
  type: 'object',
  properties: {
    root: { type: 'boolean' },
    version: { type: 'string' }
  },
  required: ['root', 'version'],
  additionalProperties: false
} as const

type RootResponse = FromSchema<typeof rootResponseSchema>

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', {
    schema: {
      response: {
        200: rootResponseSchema
      }
    }
  }, async function (request, reply): Promise<RootResponse> {
    return {
      root: true,
      version: '1.0.0'
    }
  })
}

export default root
