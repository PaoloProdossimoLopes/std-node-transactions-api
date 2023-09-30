import { randomUUID } from 'crypto'
import fastify from 'fastify'
import { databaseBuilder } from './database'

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

const port = 3333
app
  .listen({ port })
  .then(() => console.log(`HTTP server running on http://localhost:${port}`))
