"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserSidebar } from "@/components/user-sidebar"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    if (!userRole || userRole === "admin") {
      router.push("/login")
    } else {
      setIsAuthorized(true)
    }
  }, [router])

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#f7f7f7" }}>
      <UserSidebar />
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 border-b" style={{ borderColor: "#e7e7e7" }}>
          <h1 className="text-xl font-semibold" style={{ color: "#51247a" }}>
            PSTU Inventory Management System - User Panel
          </h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
