import express from 'express'
import 'dotenv/config'
import { Request, Response } from 'express'
import bodyParser from 'body-parser'
const app = express()
import cors from 'cors'
import cookies from 'cookie-parser'
app.use(bodyParser.json({ limit: '5mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookies())

app.use(
  cors({
    origin: process.env.FE_HOST || 'http://localhost:3000',
    credentials: true,
  }),
)

app.get('/api/hello', (_req: Request, res: Response) => {
  res.status(200).send({
    message: 'Hello World',
  })
})

export default app
