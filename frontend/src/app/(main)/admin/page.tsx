"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  BookOpen,
  MessageSquare,
  Activity,
  HelpCircle,
  Mail,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Settings,
  Shield
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
  pendingContacts: number
  recentActivity: number
  activeUsers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    pendingContacts: 0,
    recentActivity: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading stats - in real app, fetch from API
    const loadStats = async () => {
      setLoading(true)
      // Simulated data
      setTimeout(() => {
        setStats({
          totalUsers: 1250,
          totalCourses: 48,
          totalEnrollments: 3420,
          pendingContacts: 12,
          recentActivity: 156,
          activeUsers: 342
        })
        setLoading(false)
      }, 500)
    }
    loadStats()
  }, [])

  const adminModules = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: Users,
      href: "/admin/users",
      color: "bg-blue-500"
    },
    {
      title: "Course Management",
      description: "Manage courses and content",
      icon: BookOpen,
      href: "/admin/courses",
      color: "bg-green-500"
    },
    {
      title: "Content Moderation",
      description: "Review and moderate reported content",
      icon: Shield,
      href: "/admin/moderation",
      color: "bg-red-500"
    },
    {
      title: "Forum Moderation",
      description: "Moderate discussions and posts",
      icon: MessageSquare,
      href: "/admin/forums",
      color: "bg-purple-500"
    },
    {
      title: "Activity Logs",
      description: "View system activity and audit logs",
      icon: Activity,
      href: "/admin/activity-logs",
      color: "bg-orange-500"
    },
    {
      title: "FAQ Management",
      description: "Manage frequently asked questions",
      icon: HelpCircle,
      href: "/admin/faqs",
      color: "bg-cyan-500"
    },
    {
      title: "Contact Messages",
      description: "View and respond to contact submissions",
      icon: Mail,
      href: "/admin/contacts",
      color: "bg-pink-500"
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-gray-500"
    }
  ]

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      change: "+12%",
      positive: true
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      change: "+8%",
      positive: true
    },
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      change: "+3",
      positive: true
    },
    {
      title: "Enrollments",
      value: stats.totalEnrollments,
      icon: TrendingUp,
      change: "+24%",
      positive: true
    },
    {
      title: "Pending Contacts",
      value: stats.pendingContacts,
      icon: Mail,
      change: "5 new",
      positive: false
    },
    {
      title: "Recent Activity",
      value: stats.recentActivity,
      icon: Activity,
      change: "Today",
      positive: true
    }
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your platform and monitor activity
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <stat.icon className="h-8 w-8 text-muted-foreground" />
                <span className={`text-xs ${stat.positive ? 'text-green-500' : 'text-yellow-500'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">
                  {loading ? "..." : stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Modules */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminModules.map((module, index) => (
            <Link key={index} href={module.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${module.color}`}>
                      <module.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">12 pending contact messages</p>
                  <p className="text-xs text-muted-foreground">Requires response</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/admin/contacts">View</Link>
                </Button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">5 new user registrations</p>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/admin/users">View</Link>
                </Button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">3 reported forum posts</p>
                  <p className="text-xs text-muted-foreground">Pending review</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/admin/forums">Review</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <Link href="/admin/users?action=create">
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Add User</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <Link href="/admin/courses?action=create">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs">Add Course</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <Link href="/admin/faqs?action=create">
                  <HelpCircle className="h-5 w-5" />
                  <span className="text-xs">Add FAQ</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                <Link href="/admin/activity-logs?export=true">
                  <Activity className="h-5 w-5" />
                  <span className="text-xs">Export Logs</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
