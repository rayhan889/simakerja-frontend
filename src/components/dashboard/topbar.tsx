import { Avatar } from "radix-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useAuth } from "@/hooks/use-auth";
import { Link, useNavigate } from "react-router";
import { displayFullName } from "@/lib/display-fullname";
import { getInitials } from "@/lib/profile-fallack";
import { useState } from "react";
import { LogoutConfirmDialog } from "@/components/dashboard/logout-confirm-dialog";

export const DashboardTopbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [imageError, setImageError] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    
    const hasImage = Boolean(user?.profilePicture) && !imageError;

    const handleLogout = async () => {
      await logout();
      navigate('/login', { replace: true });
    }

  return (
     <header className=" sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 backdrop-blur-md lg:px-8">
      <div>
        <h3 className="text-sm text-gray-600 text-start">
            Selamat datang kembali, <br />
            <span className=" text-teal-950 font-semibold capitalize">{displayFullName(user?.fullName || "")}</span>
        </h3>
      </div>

      <div className="flex items-center gap-3">
        {/* <button
          type="button"
          className="relative cursor-pointer flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            2
          </span>
        </button> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar.Root className="h-9 w-9 cursor-pointer">
              {hasImage && user && (
                <Avatar.Image
                  src={user.profilePicture}
                  alt={user.fullName || "User avatar"}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="h-full w-full rounded-full object-cover"
                />
              )}
  
              <Avatar.Fallback
                delayMs={0}
                className="flex h-full w-full items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground"
              >
                {getInitials(user?.fullName as string)}
              </Avatar.Fallback>
          </Avatar.Root>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-6">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                Pengaturan
              </DropdownMenuLabel>
              <Link to="/dashboard/user/update">
                <DropdownMenuItem>
                  Profil
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>Logout</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
      </DropdownMenu>

      <LogoutConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
      />
      </div>
    </header>
  )
}
