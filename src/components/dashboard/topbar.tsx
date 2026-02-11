import { Bell } from "lucide-react"
import { Avatar } from "radix-ui";

import { useAuth } from "@/hooks/use-auth";

export const DashboardTopbar = () => {
    const { user } = useAuth();

  return (
     <header className="font-secondary sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 backdrop-blur-md lg:px-8">
      <div>
        <h3 className="text-sm text-gray-500 text-start">
            Selamat datang kembali, <br />
            <span className=" text-teal-950 font-semibold">{user?.fullName.replace(/^\d+_/, "")}</span>
        </h3>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative cursor-pointer flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            2
          </span>
        </button>
        <Avatar.Root className="h-9 w-9 cursor-pointer">
            <Avatar.Image
              src={user?.profilePicture}
              alt={user?.fullName}
              className="rounded-full"
            />
          <Avatar.Fallback className="bg-primary text-primary-foreground text-xs font-bold">
            {user?.fullName.split(" ").map(name => name[0]).join("")}
          </Avatar.Fallback>
        </Avatar.Root>
      </div>
    </header>
  )
}
