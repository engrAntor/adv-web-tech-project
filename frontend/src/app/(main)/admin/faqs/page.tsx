"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Search,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Eye,
  EyeOff
} from "lucide-react"
import { toast } from "sonner"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

const FAQ_CATEGORIES = [
  "General",
  "Courses",
  "Payments",
  "Account",
  "Technical",
  "Certificates"
]

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    isPublished: true
  })

  useEffect(() => {
    loadFaqs()
  }, [categoryFilter])

  const loadFaqs = async () => {
    setLoading(true)
    setTimeout(() => {
      const mockFaqs: FAQ[] = [
        {
          id: "1",
          question: "How do I enroll in a course?",
          answer: "To enroll in a course, navigate to the course page and click the 'Enroll Now' button. You'll be guided through the payment process if the course is paid, or enrolled immediately for free courses.",
          category: "Courses",
          order: 1,
          isPublished: true,
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z"
        },
        {
          id: "2",
          question: "What payment methods are accepted?",
          answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for enterprise accounts.",
          category: "Payments",
          order: 2,
          isPublished: true,
          createdAt: "2024-01-14T09:00:00Z",
          updatedAt: "2024-01-14T09:00:00Z"
        },
        {
          id: "3",
          question: "How do I reset my password?",
          answer: "Click on 'Forgot Password' on the login page, enter your email address, and you'll receive a link to reset your password.",
          category: "Account",
          order: 3,
          isPublished: true,
          createdAt: "2024-01-13T08:00:00Z",
          updatedAt: "2024-01-13T08:00:00Z"
        },
        {
          id: "4",
          question: "Can I get a refund?",
          answer: "Yes, we offer a 30-day money-back guarantee on all courses. Contact support with your order details to request a refund.",
          category: "Payments",
          order: 4,
          isPublished: true,
          createdAt: "2024-01-12T07:00:00Z",
          updatedAt: "2024-01-12T07:00:00Z"
        },
        {
          id: "5",
          question: "How do I download my certificate?",
          answer: "After completing a course, go to 'My Certificates' in your dashboard. Click the download button next to the certificate you want.",
          category: "Certificates",
          order: 5,
          isPublished: false,
          createdAt: "2024-01-11T06:00:00Z",
          updatedAt: "2024-01-11T06:00:00Z"
        }
      ]
      setFaqs(mockFaqs)
      setLoading(false)
    }, 500)
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || faq.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleCreate = async () => {
    if (!formData.question || !formData.answer) {
      toast.error("Please fill in all required fields")
      return
    }
    toast.success("FAQ created successfully")
    setShowCreateDialog(false)
    setFormData({ question: "", answer: "", category: "General", isPublished: true })
    loadFaqs()
  }

  const handleUpdate = async () => {
    if (!selectedFaq) return
    toast.success("FAQ updated successfully")
    setShowEditDialog(false)
    loadFaqs()
  }

  const handleDelete = async () => {
    if (!selectedFaq) return
    toast.success("FAQ deleted successfully")
    setFaqs(faqs.filter(f => f.id !== selectedFaq.id))
    setShowDeleteDialog(false)
    setSelectedFaq(null)
  }

  const handleTogglePublish = async (faqId: string) => {
    const faq = faqs.find(f => f.id === faqId)
    if (!faq) return
    toast.success(`FAQ ${faq.isPublished ? 'unpublished' : 'published'} successfully`)
    setFaqs(faqs.map(f => f.id === faqId ? { ...f, isPublished: !f.isPublished } : f))
  }

  const openEditDialog = (faq: FAQ) => {
    setSelectedFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isPublished: faq.isPublished
    })
    setShowEditDialog(true)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">FAQ Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage frequently asked questions
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {FAQ_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* FAQs List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center p-8">Loading FAQs...</div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No FAQs found
            </div>
          ) : (
            <div className="divide-y">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-start gap-4">
                    <div className="cursor-move text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{faq.question}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {faq.answer}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-muted">
                            {faq.category}
                          </span>
                          <button
                            onClick={() => handleTogglePublish(faq.id)}
                            className={`p-1.5 rounded-md ${
                              faq.isPublished
                                ? "text-green-600 bg-green-100 dark:bg-green-900/30"
                                : "text-gray-400 bg-gray-100 dark:bg-gray-900/30"
                            }`}
                          >
                            {faq.isPublished ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(faq)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFaq(faq)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Order: {faq.order}</span>
                        <span>Updated: {new Date(faq.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create FAQ Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New FAQ</DialogTitle>
            <DialogDescription>Add a new frequently asked question</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter the question..."
              />
            </div>
            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Enter the answer..."
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.isPublished ? "published" : "draft"}
                  onValueChange={(value) => setFormData({ ...formData, isPublished: value === "published" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create FAQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>Update the FAQ details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.isPublished ? "published" : "draft"}
                  onValueChange={(value) => setFormData({ ...formData, isPublished: value === "published" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this FAQ. This action cannot be undone.
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
    </div>
  )
}
