const path = require('path')
const http = require('http')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const app = require('./src/app')
const connectDB = require('./src/config/db')
const setupSocket = require('./src/config/socket')

const httpServer = http.createServer(app)
const io = setupSocket(httpServer)
app.set('io', io) // makes io accessible in controllers via req.app.get('io')

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  // Register cron jobs (they self-schedule via node-cron)
  require('./src/jobs/reviewWindow.job')
  require('./src/jobs/scoreUpdater.job')
  require('./src/jobs/accountDeletion.job')
  require('./src/jobs/eventReminder.job')

  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

startServer().catch((error) => {
  console.error('❌ Server startup failed:', error)
  process.exit(1)
})

module.exports = app