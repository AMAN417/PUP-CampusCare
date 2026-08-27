import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import agentRouter from './routes/agent'
import incidentsRouter from './routes/incidents'
import notificationsRouter from './routes/notifications'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/api/agent', agentRouter)
app.use('/api/incidents', incidentsRouter)
app.use('/api/notifications', notificationsRouter)


app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'CampusOps AI Server', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
