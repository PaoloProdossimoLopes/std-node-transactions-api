import fastify from 'fastify'

const app = fastify()

app.get('/hello', () => {
  return 'Hellow'
})

const port = 3333
app
  .listen({ port })
  .then(() => console.log(`HTTP server running on http://localhost:${port}`))
