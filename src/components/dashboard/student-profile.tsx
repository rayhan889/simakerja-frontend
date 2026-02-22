import { Avatar } from 'radix-ui'
import { User, IdCard, University, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

import { useAuth } from '@/hooks/use-auth'
import { studyProgramOptions } from '@/types/submission.type'
import { displayFullName } from '@/lib/display-fullname'

export const DashboardStudentProfile = () => {

    const { user } = useAuth();
  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6">
        
        <div className="flex items-center gap-x-5">
          <Avatar.Root className="h-24 w-24 shrink-0">
            <Avatar.Image
              src={user?.profilePicture}
              alt={user?.fullName}
              className="rounded-full"
            />
            <Avatar.Fallback className="bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
              {user?.fullName.split(" ").map(name => name[0]).join("")}
            </Avatar.Fallback>
          </Avatar.Root>

          <div className='flex flex-col items-start gap-y-3'>
            <h1 className='text-2xl font-bold'>{displayFullName(user?.fullName || "")}</h1>

            <Badge variant={'outline'} className='border-gray-200'>
              {user?.role === 'student' ? 'Mahasiswa' : user?.role === 'staff' ? 'Staf' : 'Admin'}
            </Badge>
          </div>
        </div>

        <hr className='w-full h-px text-gray-200' />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
            <DetailItem icon={User} label="Nama" value={displayFullName(user?.fullName || "-")} />
            <DetailItem icon={IdCard} label="NIM" value={user?.nim || "-"} />
            <DetailItem icon={University} label="Jurusan" value={studyProgramOptions.find(option => option.value === user?.studyProgram)?.label || "-"} />
            <DetailItem icon={Phone} label="Telepon" value={user?.phoneNumber || "-"} />
        </div>

      </div>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-[#F4F6F5] p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-600/10">
        <Icon className="h-4 w-4 text-teal-950" />
      </div>
      <div className="min-w-0 text-start font-secondary">
        <p className="text-xs font-medium text-gray-600">{label}</p>
        <p className="truncate text-sm font-bold text-teal-950">
          {value}
        </p>
      </div>
    </div>
  )
}