import { SignUpPage } from '../pages/SignUpPage.tsx'
import { DashboardPage } from '../pages/DashboardPage.tsx'
import { SignInPage } from '../pages/SignInPage.tsx'

export const routes = [
  {
    path: '/sign-up',
    component: <SignUpPage />,
    auth: false,
  },
  {
    path: '/',
    component: <DashboardPage />,
    auth: false,
  },
  {
    path: '/sign-in',
    component: <SignInPage />,
    auth: false,
  },
]
