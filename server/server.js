const path = require('path')
const http = require('http')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const app = require('./src/app')
const connectDB = require('./src/config/db')
const { initSocket } = require('./src/services/socket.service')

const server = http.createServer(app)
initSocket(server)

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

startServer().catch((error) => {
  console.error('❌ Server startup failed:', error)
  process.exit(1)
})

module.exports = app