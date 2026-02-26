import { createBrowserRouter, RouterProvider } from 'react-router'
import { GuestRoute } from '@/routes/guards/guest-route'
import { LoginPage } from '@/pages/auth/login'
import { ProtectedRoute } from '@/routes/guards/protected-route'
import { DashboardLayout } from './layouts/dashboard-layout'
import { DashboardPage } from '@/pages/dashboard'
import { DashboardTrackSubmissionPage } from '@/pages/dashboard/track-submission'
import { DashboardSubmitSubmissionPage } from '@/pages/dashboard/submit-submission'
import DashboardUpdateSubmissionPage from '@/pages/dashboard/update-submission'
import DashboardUpdateUserPage from '@/pages/dashboard/update-user'
import DashboardStaffTrackSubmission from '@/pages/dashboard/staff-track-submission'
import DashboardStaffTrackDetailSubmission from '@/pages/dashboard/staff-track-detail-submission'

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
            <ProtectedRoute allowedRoles={['student', 'staff']}>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <DashboardPage />
            },
            {
                path: "/dashboard",
                element: <DashboardPage />
            },
            {
                path: "/dashboard/track-submission",
                element: (
                    <ProtectedRoute allowedRoles={['student']}>
                        <DashboardTrackSubmissionPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard/submit-submission",
                element: (
                    <ProtectedRoute allowedRoles={['student']}>
                        <DashboardSubmitSubmissionPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard/submission/:submissionId/edit",
                element: (
                    <ProtectedRoute allowedRoles={['student']}>
                        <DashboardUpdateSubmissionPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard/user/update",
                element: (
                    <ProtectedRoute allowedRoles={['student', 'staff']}>
                        <DashboardUpdateUserPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard/staff-track-submission",
                element: (
                    <ProtectedRoute allowedRoles={['staff']}>
                        <DashboardStaffTrackSubmission />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard/staff-track-detail-submission",
                element: (
                    <ProtectedRoute allowedRoles={['staff']}>
                        <DashboardStaffTrackDetailSubmission />
                    </ProtectedRoute>
                )
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
