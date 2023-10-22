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
import genFunc from 'connect-pg-simple'
import { sharedErrorHandler, withErrorHandling } from './src/infrastructure/shared/Errors'
import { signUpUserController, signInUserController } from './src/infrastructure/controllers'
import { createUserUsecase } from './src/domain/usecases/createUserUsecase'
import { prismaUserRepository } from './src/infrastructure/repositories'
import { dateGenerator, uuidGenerator } from './src/infrastructure/shared'

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

app.get('/api/error', (_req, res) => res.send('error logging in'))

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

app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get(
  '/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  async function (req, res) {
    // Successful authentication, redirect success.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const passportEmail = req.user?._json.email
    const successRedirect = (process.env.HOST_FE || 'http://localhost:3000') + '/auth-redirect/dashboard'

    const usecase = createUserUsecase({
      userRepository: prismaUserRepository,
      dateGenerator: dateGenerator,
      uuidGenerator: uuidGenerator,
    })
    try {
      await usecase({
        email: passportEmail,
        password: null,
      })
      req.session.user = {
        email: passportEmail,
      }
      res.redirect(successRedirect)
    } catch (err) {
      req.session.user = {
        email: passportEmail,
      }
      res.redirect(successRedirect)
    }
  },
)

app.post('/api/sign-up', withErrorHandling(signUpUserController, sharedErrorHandler))
app.post('/api/sign-in', withErrorHandling(signInUserController, sharedErrorHandler))
app.get('/api/hello', (_req: Request, res: Response) => {
  res.status(200).send({
    message: 'Hello World',
  })
})

app.get('/api/auth', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({
      user: req.session.user,
    })
  }
  return res.status(401).json({
    message: 'Unauthorized',
  })
})

export default app
