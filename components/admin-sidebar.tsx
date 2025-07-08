"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Building,
  Truck,
  Package,
  ArrowUp,
  ArrowDown,
  Trash2,
  FileText,
  Users,
  Bell,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Departments",
    icon: Building2,
    submenu: [
      { title: "Create Department", href: "/admin/departments/create" },
      { title: "All Departments", href: "/admin/departments" },
    ],
  },
  {
    title: "Offices",
    icon: Building,
    submenu: [
      { title: "Create Office", href: "/admin/offices/create" },
      { title: "All Offices", href: "/admin/offices" },
    ],
  },
  {
    title: "Suppliers",
    icon: Truck,
    submenu: [
      { title: "Create Supplier", href: "/admin/suppliers/create" },
      { title: "All Suppliers", href: "/admin/suppliers" },
    ],
  },
  {
    title: "Items",
    icon: Package,
    submenu: [
      { title: "Create Item", href: "/admin/items/create" },
      { title: "All Items", href: "/admin/items" },
    ],
  },
  {
    title: "Stock In",
    icon: ArrowUp,
    submenu: [
      { title: "Stock Entry", href: "/admin/stock-in/create" },
      { title: "Stock In History", href: "/admin/stock-in" },
    ],
  },
  {
    title: "Stock Out",
    icon: ArrowDown,
    submenu: [
      { title: "Issue Stock", href: "/admin/stock-out/create" },
      { title: "Stock Out History", href: "/admin/stock-out" },
    ],
  },
  {
    title: "Dead Stock",
    icon: Trash2,
    submenu: [
      { title: "Record Dead Stock", href: "/admin/dead-stock/create" },
      { title: "Dead Stock List", href: "/admin/dead-stock" },
    ],
  },
  {
    title: "Reports",
    icon: FileText,
    submenu: [
      { title: "Current Stock", href: "/admin/reports/current-stock" },
      { title: "Department-wise", href: "/admin/reports/department" },
      { title: "Office-wise", href: "/admin/reports/office" },
      { title: "User-wise", href: "/admin/reports/user" },
      { title: "Item-wise", href: "/admin/reports/item" },
      { title: "Date-wise", href: "/admin/reports/date" },
    ],
  },
  {
    title: "Users",
    icon: Users,
    submenu: [
      { title: "Create User", href: "/admin/users/create" },
      { title: "All Teachers", href: "/admin/users/teachers" },
      { title: "All Staff", href: "/admin/users/staff" },
      { title: "All Users", href: "/admin/users" },
    ],
  },
  {
    title: "Requests",
    href: "/admin/requests",
    icon: Bell,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "")
    setUserRole(localStorage.getItem("userRole") || "")
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
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
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.submenu ? (
              <div className="space-y-1">
                <div className="flex items-center space-x-2 p-2 font-medium" style={{ color: "#51247a" }}>
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.title}</span>
                </div>
                <div className="ml-6 space-y-1">
                  {item.submenu.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      href={subItem.href}
                      className={cn(
                        "block p-2 text-sm rounded-md transition-colors",
                        pathname === subItem.href ? "text-white" : "hover:bg-gray-100",
                      )}
                      style={
                        pathname === subItem.href ? { backgroundColor: "#51247a", color: "#ffffff" } : { color: "#666" }
                      }
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                href={item.href!}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-md transition-colors",
                  pathname === item.href ? "text-white" : "hover:bg-gray-100",
                )}
                style={pathname === item.href ? { backgroundColor: "#51247a", color: "#ffffff" } : { color: "#51247a" }}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.title}</span>
              </Link>
            )}
          </div>
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
