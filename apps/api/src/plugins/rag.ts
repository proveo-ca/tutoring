import fp from 'fastify-plugin'
import { FastifySensibleOptions } from '@fastify/sensible'
import proxy from "@fastify/http-proxy";

export default fp<FastifySensibleOptions>(async (fastify) => {
  fastify.register(proxy, {
    upstream: `${process.env.RAG_SERVICE_URL}/`,
    prefix: '/ask',
    http2: false,
    rewritePrefix: '/ask',
  });
})
