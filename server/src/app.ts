import cors from '@fastify/cors'
import fastify from 'fastify'
import { env } from './config.js'
import { pool } from './db/index.js'
import { HttpError } from './errors.js'
import { registerUrlRoutes } from './routes/urls.js'

export async function buildApp() {
  const app = fastify({ logger: true })
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)

  await app.register(cors, {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  })

  app.get('/health', async () => ({ status: 'ok' }))
  await app.register(registerUrlRoutes)

  app.setNotFoundHandler((_request, reply) => {
    return reply.code(404).send({ message: 'Rota não encontrada.' })
  })

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({ message: error.message })
    }

    app.log.error(error)
    return reply.code(500).send({ message: 'Não foi possível concluir a solicitação.' })
  })

  app.addHook('onClose', async () => {
    await pool.end()
  })

  return app
}
