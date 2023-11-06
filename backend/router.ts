import { Request, Response, Router } from 'express'
import passport from 'passport'
import { createUserUsecase } from './src/domain/usecases'
import { prismaUserRepository } from './src/infrastructure/repositories'
import { dateGenerator, uuidGenerator } from './src/infrastructure/shared'
import { sharedErrorHandler, withErrorHandling } from './src/infrastructure/shared/Errors'
import {
  deleteBoardColumnController,
  deleteBoardController,
  getBoardCollumnsController,
  getColumnTasksController,
  patchTaskGroupingController,
  postBoardController,
  signInUserController,
  signUpUserController,
  getSubtasksController,
  getBoardsController,
  putBoardController,
  postTaskController,
  getTaskController,
  patchSubtaskController,
  deleteTaskController,
  putTaskController,
  insertStarterBoards,
} from './src/infrastructure/controllers'

const router = Router()

router.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get(
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
      const user = await usecase({
        email: passportEmail,
        password: null,
      })
      req.session.user = {
        email: passportEmail,
        id: user.id,
      }

      await insertStarterBoards(user.id)

      res.redirect(successRedirect)
    } catch (err) {
      const user = await prismaUserRepository.getByEmail(passportEmail)
      req.session.user = {
        email: passportEmail,
        id: user!.id,
      }
      res.redirect(successRedirect)
    }
  },
)
router.get('/api/hello', (_req: Request, res: Response) => {
  res.status(200).send({
    message: 'Hello World',
  })
})

router.get('/api/auth', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({
      user: {
        email: req.session.user.email,
      },
    })
  }
  return res.status(401).json({
    message: 'Unauthorized',
  })
})

router.get('/api/boards', withErrorHandling(getBoardsController, sharedErrorHandler))

router.patch('/api/boards/grouping', withErrorHandling(patchTaskGroupingController, sharedErrorHandler))

router.get('/api/boards/:boardId/columns', withErrorHandling(getBoardCollumnsController, sharedErrorHandler))

router.post('/api/boards/:boardId/columns/:columnId/tasks', withErrorHandling(postTaskController, sharedErrorHandler))

router.get('/api/tasks/:taskId/subtasks', withErrorHandling(getSubtasksController, sharedErrorHandler))

router.patch('/api/tasks/:taskId/subtasks/:subtaskId', withErrorHandling(patchSubtaskController, sharedErrorHandler))

router.get('/api/tasks/:taskId', withErrorHandling(getTaskController, sharedErrorHandler))
router.put('/api/tasks/:taskId', withErrorHandling(putTaskController, sharedErrorHandler))
router.delete('/api/tasks/:taskId', withErrorHandling(deleteTaskController, sharedErrorHandler))

router.get(
  '/api/boards/:boardId/columns/:columnId/tasks',
  withErrorHandling(getColumnTasksController, sharedErrorHandler),
)

router.delete(
  '/api/boards/:boardId/columns/:columnId',
  withErrorHandling(deleteBoardColumnController, sharedErrorHandler),
)

router.put('/api/boards/:boardId', withErrorHandling(putBoardController, sharedErrorHandler))

router.delete('/api/boards/:boardId', withErrorHandling(deleteBoardController, sharedErrorHandler))

router.get('/api/error', (_req, res) => res.send('error logging in'))

router.post('/api/sign-up', withErrorHandling(signUpUserController, sharedErrorHandler))
router.post('/api/sign-in', withErrorHandling(signInUserController, sharedErrorHandler))

router.post('/api/boards', withErrorHandling(postBoardController, sharedErrorHandler))

export default router
