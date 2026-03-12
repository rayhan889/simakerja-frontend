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
import DashboardListUserPage from '@/pages/dashboard/list-user'
import DashboardLecturerTrackSubmissionPage from '@/pages/dashboard/lecturer-track-submission'
import DashboardLecturerTrackSubmissionDetailPage from '@/pages/dashboard/lecturer-track-detail-submission'
import ProcessSubmissionPage from '@/pages/dashboard/process-submission'

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
            <ProtectedRoute allowedRoles={['student', 'staff', 'superadmin', 'lecturer']}>
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
                    <ProtectedRoute allowedRoles={['student']}>
                        <DashboardUpdateUserPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard/staff-track-submission",
                element: (
                    <ProtectedRoute allowedRoles={['staff', 'superadmin']}>
                        <DashboardStaffTrackSubmission />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard/staff-track-detail-submission",
                element: (
                    <ProtectedRoute allowedRoles={['staff', 'superadmin']}>
                        <DashboardStaffTrackDetailSubmission />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard/lecturer-track-submission",
                element: (
                    <ProtectedRoute allowedRoles={['lecturer', 'superadmin']}>
                        <DashboardLecturerTrackSubmissionPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard/lecturer-track-detail-submission",
                element: (
                    <ProtectedRoute allowedRoles={['lecturer', 'superadmin']}>
                        <DashboardLecturerTrackSubmissionDetailPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard/lecturer-process-submission/:submissionId",
                element: (
                    <ProtectedRoute allowedRoles={['lecturer', 'superadmin']}>
                        <ProcessSubmissionPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard/staff-process-submission/:submissionId",
                element: (
                    <ProtectedRoute allowedRoles={['staff', 'superadmin']}>
                        <ProcessSubmissionPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard/admin-track-users",
                element: (
                    <ProtectedRoute allowedRoles={['superadmin']}>
                        <DashboardListUserPage />
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
