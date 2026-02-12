import { DashboardStudentProfile } from '@/components/dashboard/student-profile';
import { DashboardSubmissionHistory } from '@/components/dashboard/submission-history';

export const DashboardPage = () => {
  
  return (
    <div className="max-w-full flex flex-col gap-y-6 items-center justify-center">
      <DashboardStudentProfile />
      <DashboardSubmissionHistory />
    </div>
  )
}
