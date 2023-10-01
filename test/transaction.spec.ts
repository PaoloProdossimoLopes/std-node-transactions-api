import { describe } from 'node:test'
import request from 'supertest'
import { afterAll, beforeAll, expect, it, test } from 'vitest'
import { app } from '../src/app'

describe('Transactions routes', () => {
  beforeAll(async () => {
    /**
     * Esse trecho vai resolver o asincronismo do fastify, fazendo com que
     * os testes esperem ate que a applicaçao cadastrar e finalizar o
     * registro de todas as rotas e "plugins"
     */
    await app.ready()
  })

  afterAll(async () => {
    /**
     * Apos todos os testes executarem a applicação é finalizada liberando a memoria
     */
    await app.close()
  })

  test('user can create a new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'any new transaction',
      amount: 2334,
      type: 'credit',
    })
    // .expect(201)

    expect(response.statusCode).toEqual(201)
  })

  it('should be able to list all transactions', async () => {
    const endpoint = '/transactions'
    const title = 'any new transaction'
    const amount = 2334
    const createTransactionResponse = await request(app.server)
      .post(endpoint)
      .send({
        title,
        amount,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionResponse = await request(app.server)
      .get(endpoint)
      .set('Cookie', cookies)
      .expect(200)
    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title,
        amount,
      }),
    ])
  })
})
