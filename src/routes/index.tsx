import { createBrowserRouter, RouterProvider } from 'react-router'
import { GuestRoute } from '@/routes/guards/guest-route'
import { LoginPage } from '@/pages/auth/login'
import { ProtectedRoute } from '@/routes/guards/protected-route'
import { DashboardLayout } from './layouts/dashboard-layout'
import { DashboardPage } from '@/pages/dashboard'
// import { AuthLayout } from './layouts/auth-layout'

const router = createBrowserRouter([
    {
        path: '/login',
        element: (
            <GuestRoute>
                <LoginPage />
            </GuestRoute>
        ),
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <DashboardPage />
            },
            {
                path: 'dashboard',
                element: <DashboardPage />
            }
        ]
    },
    {
        path: '/unauthorized',
        element: <div>Unauthorized Access</div>,
    },
    {
        path: '*',
        element: <div>404 Not Found</div>,
    }
])

export const AppRouter = () => {
  return (
    <RouterProvider router={router}></RouterProvider>
  )
}
