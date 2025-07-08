"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Truck, Package, ArrowUp, Trash2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/user/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create Supplier",
    href: "/user/suppliers/create",
    icon: Truck,
  },
  {
    title: "Request Stock",
    href: "/user/stock-request",
    icon: Package,
  },
  {
    title: "Stock In Request",
    href: "/user/stock-in-request",
    icon: ArrowUp,
  },
  {
    title: "Report Dead Stock",
    href: "/user/dead-stock-report",
    icon: Trash2,
  },
]

export function UserSidebar() {
  const pathname = usePathname()
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [userDepartment, setUserDepartment] = useState("")
  const [userOffice, setUserOffice] = useState("")

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "")
    setUserRole(localStorage.getItem("userRole") || "")
    setUserDepartment(localStorage.getItem("userDepartment") || "")
    setUserOffice(localStorage.getItem("userOffice") || "")
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userDepartment")
    localStorage.removeItem("userOffice")
    window.location.href = "/"
  }

  return (
    <div
      className="w-64 bg-white shadow-lg h-screen overflow-y-auto border-r"
      style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}
    >
      {/* Header with PSTU Logo */}
      <div className="p-4 border-b" style={{ backgroundColor: "#edf5ff", borderColor: "#e7e7e7" }}>
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-solid border-[#51247a]">
  <img 
    src="https://pstu.ac.bd/storage/images/images/1704261659_WhatsApp%20Image%202024-01-02%20at%205.46.49%20PM.jpeg" 
    alt="PSTU Logo" 
    className="w-full h-full object-cover rounded-full"
  />
</div>

          <div>
            <h2 className="text-sm font-semibold" style={{ color: "#51247a" }}>
              PSTU Inventory
            </h2>
            <p className="text-xs" style={{ color: "#666" }}>
              Management System
            </p>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white p-3 rounded-lg border" style={{ borderColor: "#e7e7e7" }}>
          <p className="text-sm font-medium" style={{ color: "#51247a" }}>
            {userName}
          </p>
          <p className="text-xs capitalize" style={{ color: "#666" }}>
            {userRole}
          </p>
          {userDepartment && (
            <p className="text-xs mt-1" style={{ color: "#666" }}>
              {userDepartment}
            </p>
          )}
          {userOffice && (
            <p className="text-xs mt-1" style={{ color: "#666" }}>
              {userOffice}
            </p>
          )}
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 p-2 rounded-md transition-colors",
              pathname === item.href ? "text-white" : "hover:bg-gray-100",
            )}
            style={pathname === item.href ? { backgroundColor: "#51247a", color: "#ffffff" } : { color: "#51247a" }}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t mt-auto" style={{ borderColor: "#e7e7e7" }}>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center space-x-2 bg-transparent hover:bg-red-50"
          style={{ borderColor: "#e7e7e7", color: "#51247a" }}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}
