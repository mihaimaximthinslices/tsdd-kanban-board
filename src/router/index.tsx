import { SignUpPage } from '../pages/SignUpPage.tsx'
import { DashboardPage } from '../pages/DashboardPage.tsx'
import { SignInPage } from '../pages/SignInPage.tsx'
import AuthRedirect from '../pages/AuthRedirect.tsx'

export const routes = [
  {
    path: '/sign-up',
    component: <SignUpPage />,
    auth: false,
  },
  {
    path: '/',
    component: <DashboardPage />,
    auth: true,
  },
  {
    path: '/sign-in',
    component: <SignInPage />,
    auth: false,
  },
  {
    path: '/auth-redirect/:route',
    component: <AuthRedirect />,
    auth: false,
  },
]
