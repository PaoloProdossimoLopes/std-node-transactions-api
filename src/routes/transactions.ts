import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { databaseBuilder } from '../database'
import { checkSessionId } from '../middleware/check-session-id'

export async function transactionRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      /**
       * é umas das configuraçoes que o fastify permite que façamos,
       * nela podemos executar um processo (middleware) antes que o
       * handler seja chamado, podendo vazer diversas coisas, como por
       * exemplo verificar
       * OBS: podemos passar mais de um `preHandler`
       */
      preHandler: [checkSessionId],
    },
    async (req) => {
      const { sessionId } = req.cookies
      const transactions = await databaseBuilder('transactions')
        .where('session_id', sessionId)
        .select()
      return { transactions }
    },
  )

  app.get('/:id', { preHandler: checkSessionId }, async (req) => {
    const { sessionId } = req.cookies
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params)
    const transaction = await databaseBuilder('transactions')
      // .where('id', id)
      // .andWhere('session_id', sessionId)
      .where({
        session_id: sessionId,
        id,
      })
      .first()
    return { transaction }
  })

  app.get('/summary', { preHandler: checkSessionId }, async (req) => {
    const { sessionId } = req.cookies
    const summary = await databaseBuilder('transactions')
      .where('session_id', sessionId)
      .sum('amount', { as: 'amount' })
      .first()
    return { summary }
  })

  app.post('/', async (request, response) => {
    const schema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })
    const { title, amount, type } = schema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      response.cookie('sessionId', sessionId, {
        /**
         * rota que pode acessar o cookie (/transactions por
         * exemplo), porem quando usamos apenas '/' indica
         * que todas podem!
         */
        path: '/',
        /**
         * Tempo maximo ate a expiraçao do cookie, pore ser
         * utilziado tambem o `expires` ao invez do `maxAge`,
         * porem o `expeires` recebe um Date, ex:
         * `expires: new Date(2023-02-12T12:00:00)`
         * indicando a data e hora exata que sera expeirado
         */
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await databaseBuilder('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return response.status(201).send()
  })
}
