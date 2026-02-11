import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Outlet } from "react-router"

export const DashboardLayout = () => {

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarCollapsed ? "pl-[72px]" : "pl-64"
        )}
      >
        <DashboardTopbar />
        <main className="flex-1 px-6 py-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
           <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
