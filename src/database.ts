import knex from 'knex'

export const databaseBuilder = knex({
  client: 'sqlite',
  connection: {
    filename: './tmp/app.db',
  },
  useNullAsDefault: true,
})
