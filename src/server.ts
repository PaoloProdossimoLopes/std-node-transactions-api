import fastify from 'fastify'
import { databaseBuilder } from './database'

const app = fastify()

app.get('/hello', async () => {
  const tables = await databaseBuilder('sqlite_schema').select('*')
  return tables
})

const port = 3333
app
  .listen({ port })
  .then(() => console.log(`HTTP server running on http://localhost:${port}`))
