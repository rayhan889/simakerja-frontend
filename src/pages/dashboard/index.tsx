import { DashboardUserProfile } from '@/components/dashboard/user-profile';
import { DashboardSubmissionHistory } from '@/components/dashboard/submission-history';
import { useAuth } from '@/hooks/use-auth';

export const DashboardPage = () => {
  
  const { user } = useAuth();
  const isStudent = user?.role === 'student';
  return (
    <div className="max-w-full flex flex-col gap-y-6 items-center justify-center">
      <DashboardUserProfile />

      {isStudent && (
        <DashboardSubmissionHistory />
      )}
    </div>
  )
}
