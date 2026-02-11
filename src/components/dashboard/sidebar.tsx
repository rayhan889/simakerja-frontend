import { cn } from "@/lib/utils"
import {
  Home,
  FileText,
  Send,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Avatar } from "radix-ui";

import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router";
import { buttonVariants } from "../ui/button";

interface DashboardSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
  { icon: FileText, label: "Lacak Dokumen", href: "#", active: false },
  { icon: Send, label: "Pengajuan Dokumen", href: "#", active: false },
]

export const DashboardSidebar = ({
  collapsed,
  onToggle,
}: DashboardSidebarProps) => {

  const { user } = useAuth();
  console.log(user?.profilePicture)
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-teal-950 text-sidebar-foreground transition-all duration-300",
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
          "border-b border-gray-600 px-4 py-4 font-secondary",
          collapsed ? "flex justify-center" : "",
        )}
      >
        <div className={cn("flex items-center", collapsed ? "" : "gap-3")}>
          <Avatar.Root className="h-9 w-9 shrink-0">
            <Avatar.Image
              src={user?.profilePicture}
              alt={user?.fullName}
              className="rounded-full"
            />
            <Avatar.Fallback className="bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
              {user?.fullName.split(" ").map(name => name[0]).join("")}
            </Avatar.Fallback>
          </Avatar.Root>
          {!collapsed && (
            <div className="min-w-0 text-start text-white">
              <p className="truncate text-sm font-medium ">
                {user?.fullName.replace(/^\d+_/, "")}
              </p>
              <p className="text-xs capitalize">
                {user?.role === 'student' ? 'Mahasiswa' : user?.role === 'staff' ? 'Staf' : 'Admin'}
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href}
                className={buttonVariants({
                  className: cn("w-full flex items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors no-underline",
                      item.active
                        ? "bg-teal-500 text-white"
                        : "text-gray-500 hover:bg-teal-600 hover:text-white",
                      collapsed ? "justify-center px-0" : ""), variant: 'secondary', size: 'lg'}
                )}
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
