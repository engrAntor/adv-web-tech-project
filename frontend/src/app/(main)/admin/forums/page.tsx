"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Search,
  Flag,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
  MessageSquare,
  ThumbsDown,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { toast } from "sonner"

interface ReportedItem {
  id: string
  type: 'post' | 'comment'
  content: string
  authorName: string
  authorId: string
  reportedBy: string
  reportReason: string
  reportCount: number
  createdAt: string
  forumTitle: string
}

export default function ForumModeration() {
  const [reportedItems, setReportedItems] = useState<ReportedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedItem, setSelectedItem] = useState<ReportedItem | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBanDialog, setShowBanDialog] = useState(false)

  useEffect(() => {
    loadReportedItems()
  }, [currentPage, typeFilter])

  const loadReportedItems = async () => {
    setLoading(true)
    setTimeout(() => {
      const mockItems: ReportedItem[] = [
        {
          id: "1",
          type: "post",
          content: "This is spam content that violates community guidelines and should be removed immediately.",
          authorName: "SpamUser123",
          authorId: "user1",
          reportedBy: "John Doe",
          reportReason: "Spam",
          reportCount: 5,
          createdAt: "2024-01-20T14:30:00Z",
          forumTitle: "React Discussion"
        },
        {
          id: "2",
          type: "comment",
          content: "Inappropriate comment with offensive language that needs moderation.",
          authorName: "ToxicUser",
          authorId: "user2",
          reportedBy: "Jane Smith",
          reportReason: "Offensive content",
          reportCount: 3,
          createdAt: "2024-01-19T10:15:00Z",
          forumTitle: "JavaScript Help"
        },
        {
          id: "3",
          type: "post",
          content: "Misleading information about course content that could confuse students.",
          authorName: "MisleadingPoster",
          authorId: "user3",
          reportedBy: "Admin User",
          reportReason: "Misinformation",
          reportCount: 2,
          createdAt: "2024-01-18T16:45:00Z",
          forumTitle: "Course Questions"
        },
        {
          id: "4",
          type: "comment",
          content: "Self-promotional content with external links to competitor sites.",
          authorName: "PromoUser",
          authorId: "user4",
          reportedBy: "Mike Johnson",
          reportReason: "Self-promotion",
          reportCount: 4,
          createdAt: "2024-01-17T09:00:00Z",
          forumTitle: "General Discussion"
        }
      ]
      setReportedItems(mockItems)
      setTotalPages(3)
      setLoading(false)
    }, 500)
  }

  const filteredItems = reportedItems.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reportReason.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || item.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleApprove = async (itemId: string) => {
    toast.success("Content approved and reports dismissed")
    setReportedItems(reportedItems.filter(item => item.id !== itemId))
  }

  const handleDelete = async () => {
    if (!selectedItem) return
    toast.success("Content deleted successfully")
    setReportedItems(reportedItems.filter(item => item.id !== selectedItem.id))
    setShowDeleteDialog(false)
    setSelectedItem(null)
  }

  const handleBanUser = async () => {
    if (!selectedItem) return
    toast.success(`User ${selectedItem.authorName} has been banned`)
    setReportedItems(reportedItems.filter(item => item.authorId !== selectedItem.authorId))
    setShowBanDialog(false)
    setSelectedItem(null)
  }

  const getReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case "spam":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "offensive content":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "misinformation":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      case "self-promotion":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Forum Moderation</h1>
          <p className="text-muted-foreground mt-2">
            Review and moderate reported content
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Flag className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reportedItems.length}</p>
                <p className="text-xs text-muted-foreground">Pending Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reportedItems.filter(i => i.type === 'post').length}
                </p>
                <p className="text-xs text-muted-foreground">Reported Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <ThumbsDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reportedItems.filter(i => i.type === 'comment').length}
                </p>
                <p className="text-xs text-muted-foreground">Reported Comments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reportedItems.filter(i => i.reportCount >= 3).length}
                </p>
                <p className="text-xs text-muted-foreground">High Priority</p>
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
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="post">Posts</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reported Items List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center p-8">Loading reports...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No pending reports</p>
              <p className="text-sm">All content has been reviewed</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      item.type === 'post'
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      {item.type === 'post' ? (
                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <ThumbsDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium capitalize">{item.type}</span>
                            <span className="text-muted-foreground">by</span>
                            <span className="font-medium">{item.authorName}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getReasonColor(item.reportReason)}`}>
                              {item.reportReason}
                            </span>
                            {item.reportCount >= 3 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                                <Flag className="h-3 w-3" />
                                {item.reportCount} reports
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            In: {item.forumTitle}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mt-2 line-clamp-2">{item.content}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item)
                            setShowDetailDialog(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(item.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedItem(item)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700"
                          onClick={() => {
                            setSelectedItem(item)
                            setShowBanDialog(true)
                          }}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban User
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {filteredItems.length} reports
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
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Review the reported content and take action
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="capitalize">{selectedItem.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Forum</p>
                  <p>{selectedItem.forumTitle}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Author</p>
                  <p>{selectedItem.authorName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Report Count</p>
                  <p>{selectedItem.reportCount}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Report Reason</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getReasonColor(selectedItem.reportReason)}`}>
                  {selectedItem.reportReason}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Content</p>
                <div className="p-4 bg-muted rounded-lg mt-1">
                  <p className="text-sm whitespace-pre-wrap">{selectedItem.content}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reported By</p>
                <p>{selectedItem.reportedBy}</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedItem) handleApprove(selectedItem.id)
                setShowDetailDialog(false)
              }}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDetailDialog(false)
                setShowDeleteDialog(true)
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {selectedItem?.type}. The author will be notified of the removal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban User Confirmation */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              This will ban {selectedItem?.authorName} from the platform. They will no longer be able to post or comment. This action can be reversed from user management.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBanUser} className="bg-orange-500 hover:bg-orange-600">
              Ban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
