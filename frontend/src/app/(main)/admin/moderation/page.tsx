"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Search,
  Filter,
  MessageSquare,
  Star,
  Flag
} from "lucide-react"
import { toast } from "sonner"

interface ReportedContent {
  id: number
  type: 'post' | 'comment' | 'rating'
  content: string
  author: string
  reportedBy: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export default function ContentModerationPage() {
  const [reports, setReports] = useState<ReportedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  useEffect(() => {
    loadReports()
  }, [filter])

  const loadReports = async () => {
    setLoading(true)
    // Simulated data - replace with actual API call
    setTimeout(() => {
      setReports([
        {
          id: 1,
          type: 'post',
          content: 'This is a reported forum post content that contains...',
          author: 'user1@example.com',
          reportedBy: 'user2@example.com',
          reason: 'Inappropriate content',
          status: 'pending',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          type: 'comment',
          content: 'A comment that was flagged for review...',
          author: 'user3@example.com',
          reportedBy: 'user4@example.com',
          reason: 'Spam',
          status: 'pending',
          createdAt: '2024-01-14T15:45:00Z'
        },
        {
          id: 3,
          type: 'rating',
          content: 'Fake review with misleading information...',
          author: 'user5@example.com',
          reportedBy: 'instructor@example.com',
          reason: 'Fake review',
          status: 'approved',
          createdAt: '2024-01-13T08:20:00Z'
        },
      ])
      setLoading(false)
    }, 500)
  }

  const handleApprove = (id: number) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'approved' as const } : r))
    toast.success('Content approved')
  }

  const handleReject = (id: number) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r))
    toast.success('Content rejected and removed')
  }

  const handleBulkAction = (action: 'approve' | 'reject') => {
    if (selectedItems.length === 0) {
      toast.error('No items selected')
      return
    }

    setReports(reports.map(r =>
      selectedItems.includes(r.id)
        ? { ...r, status: action === 'approve' ? 'approved' as const : 'rejected' as const }
        : r
    ))
    setSelectedItems([])
    toast.success(`${selectedItems.length} items ${action}d`)
  }

  const toggleSelect = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === reports.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(reports.map(r => r.id))
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageSquare className="h-4 w-4" />
      case 'comment': return <MessageSquare className="h-4 w-4" />
      case 'rating': return <Star className="h-4 w-4" />
      default: return <Flag className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredReports = reports.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false
    if (search && !r.content.toLowerCase().includes(search.toLowerCase()) &&
        !r.author.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground mt-2">
          Review and moderate reported content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{reports.filter(r => r.status === 'pending').length}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{reports.filter(r => r.status === 'approved').length}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{reports.filter(r => r.status === 'rejected').length}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Flag className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{reports.length}</p>
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content or author..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {selectedItems.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('approve')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve ({selectedItems.length})
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleBulkAction('reject')}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject ({selectedItems.length})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reported Content</CardTitle>
          <CardDescription>Review flagged content and take action</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === reports.length && reports.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">No reports found</TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(report.id)}
                        onChange={() => toggleSelect(report.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(report.type)}
                        <span className="capitalize">{report.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{report.content}</TableCell>
                    <TableCell>{report.author}</TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={() => handleApprove(report.id)}
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600"
                              onClick={() => handleReject(report.id)}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="text-red-600" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
