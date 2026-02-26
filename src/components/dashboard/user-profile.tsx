import { Avatar } from 'radix-ui'
import { User, IdCard, University, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

import { useAuth } from '@/hooks/use-auth'
import { studyProgramOptions } from '@/types/submission.type'
import { displayFullName } from '@/lib/display-fullname'
import { cn } from '@/lib/utils';

const accentColorMap = {
  teal: {
    bg: "bg-teal-600",
    icon: "text-teal-950",
    text: "text-teal-950",
    card: "bg-teal-50",
  },
  green: {
    bg: "bg-green-600",
    icon: "text-green-950",
    text: "text-green-950",
    card: "bg-green-50",
  },
  amber: {
    bg: "bg-amber-600",
    icon: "text-amber-950",
    text: "text-amber-950",
    card: "bg-amber-50",
  },
  violet: {
    bg: "bg-violet-600",
    icon: "text-violet-950",
    text: "text-violet-950",
    card: "bg-violet-50",
  },
  sky: {
    bg: "bg-sky-600",
    icon: "text-sky-950",
    text: "text-sky-950",
    card: "bg-sky-50",
  }
} as const

type AccentColor = keyof typeof accentColorMap

export const DashboardUserProfile = () => {

    const { user } = useAuth();
    
    const isStudent = user?.role === 'student';
    const isStaff = user?.role === 'staff';
  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6 relative overflow-hidden">
        
        <div className="flex items-center gap-x-5 z-20">
          <Avatar.Root className="h-24 w-24 shrink-0">
            <Avatar.Image
              src={user?.profilePicture}
              alt={user?.fullName}
              referrerPolicy="no-referrer"
              className="rounded-full"
            />
            <Avatar.Fallback className="bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
              {user?.fullName.split(" ").map(name => name[0]).join("")}
            </Avatar.Fallback>
          </Avatar.Root>

          <div className='flex flex-col items-start gap-y-3'>
            <h1 className='text-2xl font-bold capitalize'>{displayFullName(user?.fullName || "")}</h1>

            <Badge variant={'outline'} className='border-gray-200'>
              {user?.role === 'student' ? 'Mahasiswa' : user?.role === 'staff' ? 'Staf' : 'Admin'}
            </Badge>
          </div>
        </div>

        <img src="/unesa_logo_cropped.png" alt="UNESA logo as background" className='w-96 h-auto absolute -right-20 -top-20 grayscale opacity-20 object-contain' />

        <hr className='w-full h-px text-gray-200 z-20' />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full z-20">
            {isStudent && (
              <>
                <DetailItem icon={User} label="Nama" value={displayFullName(user?.fullName || "-")} accentColor="violet" />
                <DetailItem icon={IdCard} label="NIM" value={user?.nim || "-"} accentColor="teal" />
                <DetailItem icon={University} label="Jurusan" value={studyProgramOptions.find(option => option.value === user?.studyProgram)?.label || "-"} accentColor="amber" />
                <DetailItem icon={Phone} label="Telepon" value={user?.phoneNumber || "-"} accentColor="sky" />
              </>
            )}

            {isStaff && (
              <>
                <DetailItem icon={User} label="Nama" value={displayFullName(user?.fullName || "-")} accentColor="violet" />
                <DetailItem icon={IdCard} label="NIP" value={user?.nip || "-"} accentColor="teal" />
              </>
            )}
        </div>

      </div>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
  accentColor,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  accentColor: AccentColor
}) {
  const colors = accentColorMap[accentColor]

  return (
    <div className={cn("flex items-start gap-3 rounded-lg p-3.5 bg-[#F4F6F5] border border-gray-200")}>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", colors.bg)}>
        <Icon className={cn("h-4 w-4 text-white")} />
      </div>
      <div className="min-w-0 text-start ">
        <p className="text-xs font-medium text-gray-600">{label}</p>
        <p className={cn("truncate text-sm font-bold")}>
          {value}
        </p>
      </div>
    </div>
  )
}