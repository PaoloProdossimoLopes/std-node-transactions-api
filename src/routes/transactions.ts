import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { databaseBuilder } from '../database'

export async function transactionRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const schema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })
    const { title, amount, type } = schema.parse(request.body)

    await databaseBuilder('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })

    return response.status(201).send()
  })
}
