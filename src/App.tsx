import './App.css'
import { Route, Routes } from 'react-router-dom'
import { routes } from './router'
import { PrivateRoute } from './components/PrivateRoute.tsx'
import { useUser } from './hooks/useUser.tsx'
import { useThemeSelector } from './useThemeSelector.tsx'
import React from 'react'

function App() {
  useUser()
  useThemeSelector()
  return (
    <Routes>
      {routes.map((route) =>
        route.auth ? (
          <Route
            path={route.path}
            key={route.path}
            element={
              <React.Suspense fallback={<></>}>
                <PrivateRoute>{route.component}</PrivateRoute>
              </React.Suspense>
            }
          />
        ) : (
          <Route
            path={route.path}
            key={route.path}
            element={
              <React.Suspense fallback={<></>}>
                {route.component}
              </React.Suspense>
            }
          />
        ),
      )}
    </Routes>
  )
}

export default App
