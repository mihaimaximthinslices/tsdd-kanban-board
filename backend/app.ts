import express from 'express'
import 'dotenv/config'
import bodyParser from 'body-parser'
const app = express()
import cors from 'cors'
import cookies from 'cookie-parser'
import passport from 'passport'
import GStrategy from 'passport-google-oauth'
import session from 'express-session'
import genFunc from 'connect-pg-simple'
import router from './router'

app.use(bodyParser.json({ limit: '5mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookies())

app.use(
  cors({
    origin: [process.env.HOST_FE || 'http://localhost:3000', 'https://accounts.google.com'],
    credentials: true,
  }),
)

const PostgresqlStore = genFunc(session)
let sessionStore
if (process.env.DB_SSL === 'true') {
  sessionStore = new PostgresqlStore({
    conObject: {
      connectionString: process.env.POSTGRES_DB_CONN,
      ssl: true,
    },
  })
} else {
  sessionStore = new PostgresqlStore({
    conString: process.env.POSTGRES_DB_CONN,
  })
}
export type SessionUser = {
  email: string
}
declare module 'express-session' {
  interface SessionData {
    user: SessionUser
  }
}
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
  }),
)

app.use(passport.initialize())

const GoogleStrategy = GStrategy.OAuth2Strategy

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: (process.env.VITE_HOST_BE || 'http://localhost:3000') + '/api/auth/google/callback',
    },
    function (_accessToken, _refreshToken, profile, done) {
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

app.use(router)

export default app
