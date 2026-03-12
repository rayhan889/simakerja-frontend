import { cn } from "@/lib/utils"
import {
  Home,
  FileText,
  Send,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react"
import { Avatar } from "radix-ui";

import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation, useNavigate } from "react-router";
import { displayFullName } from "@/lib/display-fullname";
import type { UserRole } from "@/types/user.type";
import { useState } from "react";
import { getInitials } from "@/lib/profile-fallack";
import { displayRole } from "@/lib/display-role";

interface DashboardSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

type NavItem = {
  icon: React.ComponentType<{ className?: string }>,
  label: string,
  href: string
  active?: boolean
}

const baseNavItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: false }
]

const studentNavItems: NavItem[] = [
  { icon: FileText, label: "Lacak Dokumen", href: "/dashboard/track-submission", active: false },
  { icon: Send, label: "Pengajuan Dokumen", href: "/dashboard/submit-submission", active: false },
]

const staffNavItems: NavItem[] = [
  { icon: FileText, label: "Lacak Dokumen", href: "/dashboard/staff-track-submission", active: false },
]

const superadminNavItems: NavItem[] = [
   { icon: Users, label: "Lacak Pengguna", href: "/dashboard/admin-track-users", active: false },
]

const lecturerNavItems: NavItem[] = [
  { icon: FileText, label: "Lacak Dokumen", href: "/dashboard/lecturer-track-submission", active: false },
]

function getNavItemsByRole(role: UserRole): NavItem[] {
  switch (role) {
    case 'student':
      return [...baseNavItems, ...studentNavItems];
    case 'staff':
      return [...baseNavItems, ...staffNavItems];
    case 'superadmin':
      return [...baseNavItems, ...superadminNavItems];
    case 'lecturer':
      return [...baseNavItems, ...lecturerNavItems];
    default:
      return baseNavItems;
  }
}

export const DashboardSidebar = ({
  collapsed,
  onToggle,
}: DashboardSidebarProps) => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const location = useLocation();
  
  const [imageError, setImageError] = useState(false);

  const navItems = getNavItemsByRole(user?.role || 'student');

  const hasImage = Boolean(user?.profilePicture) && !imageError;

  const updatedNavItems = navItems.map(item => ({
    ...item,
    active: location.pathname === item.href
  }));

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-teal-950 text-sidebar-foreground transition-all duration-300 border-r border-gray-600",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-gray-600 px-4">
        <img src="/unesa_logo.png" alt="SIMAKerja Logo" className="flex h-9 w-9 shrink-0 rounded-lg" />
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-white">
            SIMAKerja
          </span>
        )}
      </div>

      <div
        className={cn(
          "border-b border-gray-600 px-4 py-4 ",
          collapsed ? "flex justify-center" : "",
        )}
      >
        <div className={cn("flex items-center", collapsed ? "" : "gap-3")}>
          <Avatar.Root className="h-9 w-9 shrink-0">
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
          {!collapsed && (
            <div className="min-w-0 text-start text-white">
              <p className="truncate text-sm font-medium capitalize">
                {displayFullName(user?.fullName || "")}
              </p>
              <p className="text-xs capitalize">
                {displayRole(user?.role as UserRole || "")}
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 ">
        <ul className="flex flex-col gap-2">
          {updatedNavItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href}
                className={
                  cn("w-full text-white flex items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors no-underline",
                      item.active
                        ? "bg-teal-500"
                        : " hover:bg-teal-600 ",
                      collapsed ? "justify-center px-0" : "")
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-gray-600 px-3 py-3">
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-teal-600 hover:text-white",
            collapsed ? "justify-center px-0" : "",
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-gray-600 bg-gray-50 text-teal-950 shadow-sm transition-colors hover:bg-gray-200 cursor-pointer"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  )
}
