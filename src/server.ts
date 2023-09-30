import { randomUUID } from 'crypto'
import fastify from 'fastify'
import { databaseBuilder } from './database'
import { env } from './env/index'

const app = fastify()

app.get('/hello', async () => {
  const transactions = await databaseBuilder('transactions')
    .insert({
      id: randomUUID(),
      title: 'Transação de teste',
      amount: 1000,
    })
    .returning('*')
  return transactions
})

app
  .listen({ port: env.PORT })
  .then(() =>
    console.log(`HTTP server running on http://localhost:${env.PORT}`),
  )
