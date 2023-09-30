import fastify from 'fastify'

const app = fastify()

app.get('/hello', () => {})

const port = 3333
app.listen({
  port: port
})
.then(() => console.log(`HTTP server running on http://localhost:${port}`))