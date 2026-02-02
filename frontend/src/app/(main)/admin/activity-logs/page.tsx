"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Activity,
  User,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Eye,
  Settings
} from "lucide-react"
import { toast } from "sonner"

interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  entity: string
  entityId?: string
  details?: string
  ipAddress: string
  userAgent: string
  createdAt: string
}

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  login: LogIn,
  logout: LogOut,
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  settings: Settings,
  default: Activity
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [entityFilter, setEntityFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("7days")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadLogs()
  }, [currentPage, actionFilter, entityFilter, dateRange])

  const loadLogs = async () => {
    setLoading(true)
    setTimeout(() => {
      const mockLogs: ActivityLog[] = [
        {
          id: "1",
          userId: "1",
          userName: "John Doe",
          action: "login",
          entity: "auth",
          details: "Successful login",
          ipAddress: "192.168.1.1",
          userAgent: "Chrome/120.0 Windows",
          createdAt: "2024-01-20T14:30:00Z"
        },
        {
          id: "2",
          userId: "2",
          userName: "Jane Smith",
          action: "create",
          entity: "course",
          entityId: "5",
          details: "Created new course: Advanced JavaScript",
          ipAddress: "192.168.1.2",
          userAgent: "Firefox/121.0 macOS",
          createdAt: "2024-01-20T13:15:00Z"
        },
        {
          id: "3",
          userId: "3",
          userName: "Admin User",
          action: "update",
          entity: "user",
          entityId: "10",
          details: "Updated user role to instructor",
          ipAddress: "192.168.1.3",
          userAgent: "Safari/17.0 macOS",
          createdAt: "2024-01-20T12:00:00Z"
        },
        {
          id: "4",
          userId: "1",
          userName: "John Doe",
          action: "view",
          entity: "course",
          entityId: "3",
          details: "Viewed course: React Fundamentals",
          ipAddress: "192.168.1.1",
          userAgent: "Chrome/120.0 Windows",
          createdAt: "2024-01-20T11:45:00Z"
        },
        {
          id: "5",
          userId: "4",
          userName: "Mike Johnson",
          action: "delete",
          entity: "comment",
          entityId: "25",
          details: "Deleted spam comment",
          ipAddress: "192.168.1.4",
          userAgent: "Edge/120.0 Windows",
          createdAt: "2024-01-20T10:30:00Z"
        },
        {
          id: "6",
          userId: "2",
          userName: "Jane Smith",
          action: "logout",
          entity: "auth",
          details: "User logged out",
          ipAddress: "192.168.1.2",
          userAgent: "Firefox/121.0 macOS",
          createdAt: "2024-01-20T09:00:00Z"
        },
        {
          id: "7",
          userId: "5",
          userName: "Sarah Williams",
          action: "settings",
          entity: "profile",
          details: "Updated notification preferences",
          ipAddress: "192.168.1.5",
          userAgent: "Chrome/120.0 Android",
          createdAt: "2024-01-19T22:15:00Z"
        }
      ]
      setLogs(mockLogs)
      setTotalPages(5)
      setLoading(false)
    }, 500)
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    const matchesEntity = entityFilter === "all" || log.entity === entityFilter
    return matchesSearch && matchesAction && matchesEntity
  })

  const exportLogs = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const csv = [
        ["ID", "User", "Action", "Entity", "Details", "IP Address", "Timestamp"].join(","),
        ...filteredLogs.map(log => [
          log.id,
          log.userName,
          log.action,
          log.entity,
          `"${log.details || ''}"`,
          log.ipAddress,
          new Date(log.createdAt).toISOString()
        ].join(","))
      ].join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } else {
      const json = JSON.stringify(filteredLogs, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.json`
      a.click()
    }
    toast.success(`Logs exported as ${format.toUpperCase()}`)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "login":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "logout":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      case "create":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "update":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "view":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getIcon = (action: string) => {
    const IconComponent = actionIcons[action] || actionIcons.default
    return <IconComponent className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground mt-2">
            Monitor user activity and system events
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportLogs('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => exportLogs('json')}>
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <LogIn className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-muted-foreground">Logins Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">42</p>
                <p className="text-xs text-muted-foreground">New Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Edit className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-xs text-muted-foreground">Updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Deletions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="view">View</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="comment">Comment</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Timestamp</th>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Action</th>
                  <th className="text-left p-4 font-medium">Entity</th>
                  <th className="text-left p-4 font-medium">Details</th>
                  <th className="text-left p-4 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8">Loading logs...</td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                      No activity logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium">{formatDate(log.createdAt)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="text-sm">{log.userName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {getIcon(log.action)}
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm capitalize">{log.entity}</span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {log.details || "-"}
                        </p>
                      </td>
                      <td className="p-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {log.ipAddress}
                        </code>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} logs
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
