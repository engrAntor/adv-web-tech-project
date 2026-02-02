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
  Eye,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react"
import { toast } from "sonner"
import { CourseCategory, CourseDifficulty } from "@/types"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  category: CourseCategory
  difficulty: CourseDifficulty
  price: number
  duration: number
  instructorName: string
  enrollmentCount: number
  averageRating: number
  isPublished: boolean
  createdAt: string
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: CourseCategory.PROGRAMMING,
    difficulty: CourseDifficulty.BEGINNER,
    price: 0,
    duration: 0
  })

  useEffect(() => {
    loadCourses()
  }, [currentPage, categoryFilter, difficultyFilter])

  const loadCourses = async () => {
    setLoading(true)
    setTimeout(() => {
      const mockCourses: Course[] = [
        {
          id: "1",
          title: "Introduction to React",
          description: "Learn the fundamentals of React development",
          category: CourseCategory.PROGRAMMING,
          difficulty: CourseDifficulty.BEGINNER,
          price: 49.99,
          duration: 20,
          instructorName: "John Doe",
          enrollmentCount: 1250,
          averageRating: 4.8,
          isPublished: true,
          createdAt: "2024-01-15T10:30:00Z"
        },
        {
          id: "2",
          title: "Advanced TypeScript",
          description: "Master TypeScript for enterprise applications",
          category: CourseCategory.PROGRAMMING,
          difficulty: CourseDifficulty.ADVANCED,
          price: 79.99,
          duration: 35,
          instructorName: "Jane Smith",
          enrollmentCount: 820,
          averageRating: 4.9,
          isPublished: true,
          createdAt: "2024-01-10T08:15:00Z"
        },
        {
          id: "3",
          title: "Digital Marketing Fundamentals",
          description: "Learn digital marketing strategies",
          category: CourseCategory.MARKETING,
          difficulty: CourseDifficulty.BEGINNER,
          price: 39.99,
          duration: 15,
          instructorName: "Mike Johnson",
          enrollmentCount: 540,
          averageRating: 4.5,
          isPublished: true,
          createdAt: "2024-01-18T12:00:00Z"
        },
        {
          id: "4",
          title: "Data Science with Python",
          description: "Introduction to data science concepts",
          category: CourseCategory.DATA_SCIENCE,
          difficulty: CourseDifficulty.INTERMEDIATE,
          price: 69.99,
          duration: 40,
          instructorName: "Sarah Williams",
          enrollmentCount: 980,
          averageRating: 4.7,
          isPublished: false,
          createdAt: "2024-01-20T09:00:00Z"
        }
      ]
      setCourses(mockCourses)
      setTotalPages(3)
      setLoading(false)
    }, 500)
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter
    const matchesDifficulty = difficultyFilter === "all" || course.difficulty === difficultyFilter
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const handleCreateCourse = async () => {
    if (!newCourse.title || !newCourse.description) {
      toast.error("Please fill in all required fields")
      return
    }
    toast.success("Course created successfully")
    setShowCreateDialog(false)
    setNewCourse({
      title: "",
      description: "",
      category: CourseCategory.PROGRAMMING,
      difficulty: CourseDifficulty.BEGINNER,
      price: 0,
      duration: 0
    })
    loadCourses()
  }

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return
    toast.success("Course updated successfully")
    setShowEditDialog(false)
    loadCourses()
  }

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return
    toast.success("Course deleted successfully")
    setCourses(courses.filter(c => c.id !== selectedCourse.id))
    setShowDeleteDialog(false)
    setSelectedCourse(null)
  }

  const handleTogglePublish = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (!course) return
    toast.success(`Course ${course.isPublished ? 'unpublished' : 'published'} successfully`)
    setCourses(courses.map(c => c.id === courseId ? { ...c, isPublished: !c.isPublished } : c))
  }

  const exportCourses = () => {
    const csv = [
      ["ID", "Title", "Category", "Difficulty", "Price", "Duration", "Instructor", "Enrollments", "Rating", "Status"].join(","),
      ...filteredCourses.map(c => [
        c.id,
        `"${c.title}"`,
        c.category,
        c.difficulty,
        c.price,
        c.duration,
        c.instructorName,
        c.enrollmentCount,
        c.averageRating,
        c.isPublished ? "Published" : "Draft"
      ].join(","))
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "courses-export.csv"
    a.click()
    toast.success("Courses exported successfully")
  }

  const getDifficultyColor = (difficulty: CourseDifficulty) => {
    switch (difficulty) {
      case CourseDifficulty.BEGINNER:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case CourseDifficulty.INTERMEDIATE:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case CourseDifficulty.ADVANCED:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage courses, content, and publishing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCourses}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
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
                {Object.values(CourseCategory).map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {Object.values(CourseDifficulty).map(diff => (
                  <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Course</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Difficulty</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Stats</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8">Loading courses...</td>
                  </tr>
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      No courses found
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-muted-foreground">
                            by {course.instructorName} • {course.duration}h
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{course.category}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                          {course.difficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">${course.price}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.enrollmentCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            {course.averageRating}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleTogglePublish(course.id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                            course.isPublished
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/courses/${course.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCourse(course)
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCourse(course)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
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
              Showing {filteredCourses.length} of {courses.length} courses
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

      {/* Create Course Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>Add a new course to the platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newCourse.category}
                  onValueChange={(value) => setNewCourse({ ...newCourse, category: value as CourseCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CourseCategory).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={newCourse.difficulty}
                  onValueChange={(value) => setNewCourse({ ...newCourse, difficulty: value as CourseDifficulty })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CourseDifficulty).map(diff => (
                      <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (hours)</Label>
                <Input
                  type="number"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCourse}>Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course details</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input defaultValue={selectedCourse.title} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea defaultValue={selectedCourse.description} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select defaultValue={selectedCourse.category}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CourseCategory).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select defaultValue={selectedCourse.difficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CourseDifficulty).map(diff => (
                        <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input type="number" defaultValue={selectedCourse.price} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (hours)</Label>
                  <Input type="number" defaultValue={selectedCourse.duration} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateCourse}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedCourse?.title}" and all associated content.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
