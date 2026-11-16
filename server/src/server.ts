import { env } from './config.js'
import { buildApp } from './app.js'

const app = await buildApp()

try {
  await app.listen({ host: '0.0.0.0', port: env.PORT })
} catch (error) {
  app.log.error(error)
  await app.close()
  process.exitCode = 1
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void app.close()
  })
}
