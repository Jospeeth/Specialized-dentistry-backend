import express from 'express'
import { json, urlencoded } from 'express'
import { Request, Response } from 'express'
import { corsMiddleware } from './middlewares/cors'
import dotenv from 'dotenv'
import { authenticateAdmin } from './middlewares/authAdmin'
import { adminRoutes } from './routes/adminRoutes'
import { patientRoutes } from './routes/patientRoutes'
import { billingRoutes } from './routes/billingRouter'
import cookieParser from 'cookie-parser'

const app = express()

dotenv.config()
const port = process.env.PORT || 3000
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(cookieParser())
app.use(corsMiddleware())

// Import routes
app.use('/admin', adminRoutes)
app.use('/patients', authenticateAdmin(), patientRoutes)
app.use('/billing', authenticateAdmin(), billingRoutes)


app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`)
})
