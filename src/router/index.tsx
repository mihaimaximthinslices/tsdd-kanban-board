import React from 'react'
const SignUpPage = React.lazy(() => import('../pages/SignUpPage.tsx'))
const DashboardPage = React.lazy(() => import('../pages/DashboardPage.tsx'))
const SignInPage = React.lazy(() => import('../pages/SignInPage.tsx'))
const AuthRedirect = React.lazy(() => import('../pages/AuthRedirect.tsx'))
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
  {
    path: '/*',
    component: <DashboardPage />,
    auth: true,
  },
]
