"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ArrowUp, ArrowDown, Trash2, Bell, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function UserDashboard() {
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [userDepartment, setUserDepartment] = useState("")

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "")
    setUserRole(localStorage.getItem("userRole") || "")
    setUserDepartment(localStorage.getItem("userDepartment") || "")
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#51247a" }}>
          Welcome, {userName}
        </h2>
        <p style={{ color: "#666" }}>
          {userRole === "teacher" ? "Faculty" : "Staff"} Dashboard - {userDepartment || "Administrative Office"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "#666" }}>
              My Requests
            </CardTitle>
            <Package className="h-4 w-4" style={{ color: "#51247a" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#51247a" }}>
              12
            </div>
            <p className="text-xs" style={{ color: "#666" }}>
              Total submitted
            </p>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "#666" }}>
              Pending
            </CardTitle>
            <Bell className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#51247a" }}>
              3
            </div>
            <p className="text-xs" style={{ color: "#666" }}>
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "#666" }}>
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#51247a" }}>
              8
            </div>
            <p className="text-xs" style={{ color: "#666" }}>
              This month
            </p>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "#666" }}>
              Received Items
            </CardTitle>
            <ArrowDown className="h-4 w-4" style={{ color: "#002147" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#51247a" }}>
              25
            </div>
            <p className="text-xs" style={{ color: "#666" }}>
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader>
            <CardTitle style={{ color: "#51247a" }}>Recent Requests</CardTitle>
            <CardDescription style={{ color: "#666" }}>Your latest stock requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { item: "Office Supplies", status: "Approved", date: "2024-01-15" },
                { item: "Computer Equipment", status: "Pending", date: "2024-01-14" },
                { item: "Stationery Items", status: "Approved", date: "2024-01-13" },
              ].map((request, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: "#51247a" }}>
                      {request.item}
                    </p>
                    <p className="text-sm" style={{ color: "#666" }}>
                      {request.date}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === "Approved" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {request.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader>
            <CardTitle style={{ color: "#51247a" }}>Notifications</CardTitle>
            <CardDescription style={{ color: "#666" }}>Recent updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { message: "Your request for office supplies has been approved", time: "2 hours ago", type: "success" },
                { message: "New inventory items available for request", time: "1 day ago", type: "info" },
                { message: "Monthly inventory report is ready", time: "3 days ago", type: "info" },
              ].map((notification, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${notification.type === "success" ? "bg-green-500" : ""}`}
                    style={{ backgroundColor: notification.type === "info" ? "#002147" : undefined }}
                  />
                  <div>
                    <p className="text-sm" style={{ color: "#666" }}>
                      {notification.message}
                    </p>
                    <p className="text-xs" style={{ color: "#666" }}>
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
        <CardHeader>
          <CardTitle style={{ color: "#51247a" }}>Quick Actions</CardTitle>
          <CardDescription style={{ color: "#666" }}>Frequently used functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              style={{ borderColor: "#e7e7e7" }}
            >
              <Package className="w-8 h-8 mb-2" style={{ color: "#51247a" }} />
              <h4 className="font-medium" style={{ color: "#51247a" }}>
                Request Stock
              </h4>
              <p className="text-sm" style={{ color: "#666" }}>
                Submit new stock request
              </p>
            </div>
            <div
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              style={{ borderColor: "#e7e7e7" }}
            >
              <ArrowUp className="w-8 h-8 mb-2" style={{ color: "#51247a" }} />
              <h4 className="font-medium" style={{ color: "#51247a" }}>
                Stock In Request
              </h4>
              <p className="text-sm" style={{ color: "#666" }}>
                Request to add inventory
              </p>
            </div>
            <div
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              style={{ borderColor: "#e7e7e7" }}
            >
              <Trash2 className="w-8 h-8 mb-2" style={{ color: "#51247a" }} />
              <h4 className="font-medium" style={{ color: "#51247a" }}>
                Report Dead Stock
              </h4>
              <p className="text-sm" style={{ color: "#666" }}>
                Report damaged items
              </p>
            </div>
            <div
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              style={{ borderColor: "#e7e7e7" }}
            >
              <Bell className="w-8 h-8 mb-2" style={{ color: "#51247a" }} />
              <h4 className="font-medium" style={{ color: "#51247a" }}>
                View Notifications
              </h4>
              <p className="text-sm" style={{ color: "#666" }}>
                Check latest updates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
