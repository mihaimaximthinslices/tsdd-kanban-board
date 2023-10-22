import express from 'express'
import 'dotenv/config'
import { Request, Response } from 'express'
import bodyParser from 'body-parser'
const app = express()
import cors from 'cors'
import cookies from 'cookie-parser'
import passport from 'passport'
import GStrategy from 'passport-google-oauth'
import session from 'express-session'

app.use(bodyParser.json({ limit: '5mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookies())

app.use(
  cors({
    origin: [process.env.HOST_FE || 'http://localhost:3000', 'https://accounts.google.com'],
    credentials: true,
  }),
)

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET',
  }),
)

app.use(passport.initialize())

app.get('/api/success', (_req, res) => res.send('login successful'))
app.get('/api/error', (_req, res) => res.send('error logging in'))

const GoogleStrategy = GStrategy.OAuth2Strategy

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: (process.env.VITE_HOST_BE || 'http://localhost:3000') + '/api/auth/google/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(accessToken, refreshToken, profile, done)
      return done(null, profile)
    },
  ),
)
passport.serializeUser(function (user, cb) {
  cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
  cb(null, obj as Express.User)
})

app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get(
  '/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  function (req, res) {
    // Successful authentication, redirect success.
    console.log(req)
    res.redirect(process.env.HOST_FE || 'http://localhost:3000')
  },
)

app.get('/api/hello', (_req: Request, res: Response) => {
  res.status(200).send({
    message: 'Hello World',
  })
})

export default app
