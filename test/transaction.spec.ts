import { execSync } from 'child_process'
import { describe } from 'node:test'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, expect, it, test } from 'vitest'
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

  beforeEach(() => {
    /**
     * o metodo `execSync` da lib `child_process`
     * serve para executar comandos de terminal
     *
     * nesse caso usaremos para limapr obanco de
     * dados de teste com o comando:
     * `npm run knex migrate:rollback --all`
     *
     * e dps criar as tableas novamete com o comando:
     * `npm run knex migrate:latest`
     */
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
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

  it('should be able to get as specific transaction', async () => {
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

    const transaction = listTransactionResponse.body.transactions[0]

    const getTransactionResponse = await request(app.server)
      .get(`${endpoint}/${transaction.id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionResponse.body.transaction.id, transaction.id)
    expect(getTransactionResponse.body.transaction.title, transaction.title)
    expect(getTransactionResponse.body.transaction.amount, transaction.amount)
  })

  it('should be able to ge the summary', async () => {
    const endpoint = '/transactions'
    const createTransactionResponse = await request(app.server)
      .post(endpoint)
      .send({
        title: 'any debit transaction',
        amount: 2000,
        type: 'debit',
      })

    await request(app.server).post(endpoint).send({
      title: 'any credit transaction',
      amount: 5000,
      type: 'credit',
    })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const summaryResponse = await request(app.server)
      .get(`${endpoint}/summary`)
      .set('Cookie', cookies)
      .expect(200)
    expect(summaryResponse.body.summary).toEqual({
      amount: -2000,
    })
  })
})
