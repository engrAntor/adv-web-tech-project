"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Search,
  Mail,
  Reply,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react"
import { toast } from "sonner"
import { ContactStatus } from "@/types"

interface Contact {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: ContactStatus
  createdAt: string
  respondedAt?: string
  response?: string
}

export default function ContactManagement() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showReplyDialog, setShowReplyDialog] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")

  useEffect(() => {
    loadContacts()
  }, [currentPage, statusFilter])

  const loadContacts = async () => {
    setLoading(true)
    setTimeout(() => {
      const mockContacts: Contact[] = [
        {
          id: "1",
          name: "Alice Johnson",
          email: "alice@example.com",
          subject: "Course Access Issue",
          message: "I purchased a course yesterday but I still can't access the content. Can you please help me with this issue?",
          status: ContactStatus.PENDING,
          createdAt: "2024-01-20T14:30:00Z"
        },
        {
          id: "2",
          name: "Bob Smith",
          email: "bob@example.com",
          subject: "Refund Request",
          message: "I would like to request a refund for the course 'Advanced JavaScript' as it didn't meet my expectations.",
          status: ContactStatus.IN_PROGRESS,
          createdAt: "2024-01-19T10:15:00Z"
        },
        {
          id: "3",
          name: "Carol Williams",
          email: "carol@example.com",
          subject: "Certificate Question",
          message: "How long does it take to receive the certificate after completing a course? I finished my course 3 days ago.",
          status: ContactStatus.RESOLVED,
          createdAt: "2024-01-18T16:45:00Z",
          respondedAt: "2024-01-18T18:00:00Z",
          response: "Certificates are usually generated within 24 hours. Please check your certificates page. If you still don't see it, please let us know."
        },
        {
          id: "4",
          name: "David Brown",
          email: "david@example.com",
          subject: "Partnership Inquiry",
          message: "Our company is interested in corporate training packages. Could you please provide more information about enterprise solutions?",
          status: ContactStatus.PENDING,
          createdAt: "2024-01-20T09:00:00Z"
        },
        {
          id: "5",
          name: "Emma Davis",
          email: "emma@example.com",
          subject: "Technical Issue",
          message: "Video playback is not working on mobile devices. I've tried both Chrome and Safari browsers.",
          status: ContactStatus.CLOSED,
          createdAt: "2024-01-15T11:30:00Z",
          respondedAt: "2024-01-15T14:20:00Z",
          response: "We've identified and fixed the video playback issue on mobile devices. Please try again and let us know if you still experience problems."
        }
      ]
      setContacts(mockContacts)
      setTotalPages(3)
      setLoading(false)
    }, 500)
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || contact.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleReply = async () => {
    if (!selectedContact || !replyMessage.trim()) {
      toast.error("Please enter a reply message")
      return
    }

    toast.success("Reply sent successfully")
    setContacts(contacts.map(c =>
      c.id === selectedContact.id
        ? { ...c, status: ContactStatus.RESOLVED, response: replyMessage, respondedAt: new Date().toISOString() }
        : c
    ))
    setShowReplyDialog(false)
    setReplyMessage("")
    setSelectedContact(null)
  }

  const handleStatusChange = async (contactId: string, newStatus: ContactStatus) => {
    toast.success("Status updated successfully")
    setContacts(contacts.map(c =>
      c.id === contactId ? { ...c, status: newStatus } : c
    ))
  }

  const exportContacts = () => {
    const csv = [
      ["ID", "Name", "Email", "Subject", "Status", "Created At"].join(","),
      ...filteredContacts.map(c => [
        c.id,
        `"${c.name}"`,
        c.email,
        `"${c.subject}"`,
        c.status,
        new Date(c.createdAt).toISOString()
      ].join(","))
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success("Contacts exported successfully")
  }

  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case ContactStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case ContactStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case ContactStatus.RESOLVED:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case ContactStatus.CLOSED:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: ContactStatus) => {
    switch (status) {
      case ContactStatus.PENDING:
        return <Clock className="h-4 w-4" />
      case ContactStatus.IN_PROGRESS:
        return <AlertCircle className="h-4 w-4" />
      case ContactStatus.RESOLVED:
        return <CheckCircle className="h-4 w-4" />
      case ContactStatus.CLOSED:
        return <Archive className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
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
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground mt-2">
            Manage and respond to user inquiries
          </p>
        </div>
        <Button variant="outline" onClick={exportContacts}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.status === ContactStatus.PENDING).length}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.status === ContactStatus.IN_PROGRESS).length}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.status === ContactStatus.RESOLVED).length}
                </p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-900/30 rounded-lg">
                <Archive className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {contacts.filter(c => c.status === ContactStatus.CLOSED).length}
                </p>
                <p className="text-xs text-muted-foreground">Closed</p>
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
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.values(ContactStatus).map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center p-8">Loading messages...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No messages found
            </div>
          ) : (
            <div className="divide-y">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => {
                    setSelectedContact(contact)
                    setShowDetailDialog(true)
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{contact.name}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                              {getStatusIcon(contact.status)}
                              {contact.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                      </div>
                      <div className="mt-2 ml-13">
                        <p className="font-medium text-sm">{contact.subject}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {contact.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(contact.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedContact(contact)
                          setShowReplyDialog(true)
                        }}
                      >
                        <Reply className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredContacts.length} messages
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

      {/* Message Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedContact?.subject}</DialogTitle>
            <DialogDescription>
              From {selectedContact?.name} ({selectedContact?.email})
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContact.status)}`}>
                  {getStatusIcon(selectedContact.status)}
                  {selectedContact.status}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{selectedContact.message}</p>
              </div>
              {selectedContact.response && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Response:</p>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm whitespace-pre-wrap">{selectedContact.response}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Responded on {new Date(selectedContact.respondedAt!).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm font-medium">Update Status:</p>
                <div className="flex gap-2">
                  {Object.values(ContactStatus).map(status => (
                    <Button
                      key={status}
                      variant={selectedContact.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        handleStatusChange(selectedContact.id, status)
                        setSelectedContact({ ...selectedContact, status })
                      }}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Close</Button>
            <Button onClick={() => {
              setShowDetailDialog(false)
              setShowReplyDialog(true)
            }}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to {selectedContact?.name}</DialogTitle>
            <DialogDescription>
              Re: {selectedContact?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Original message:</p>
              <p className="text-sm">{selectedContact?.message}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Your Reply:</p>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your response..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowReplyDialog(false)
              setReplyMessage("")
            }}>
              Cancel
            </Button>
            <Button onClick={handleReply}>
              <Mail className="h-4 w-4 mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
