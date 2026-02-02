"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileQuestion,
  Clock,
  Target,
  Users,
  CheckCircle,
  Send
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import apiClient from "@/lib/axios"

interface Question {
  id?: number
  content: string
  options: string[]
  correctAnswer: number
  explanation?: string
  points: number
}

interface Quiz {
  id: number
  title: string
  description?: string
  courseId: number
  course?: { id: number; title: string }
  timeLimit: number
  passingScore: number
  isPublished: boolean
  questions?: Question[]
  _count?: { attempts: number }
}

interface Course {
  id: number
  title: string
}

export default function InstructorQuizzesPage() {
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    timeLimit: 30,
    passingScore: 70
  })

  // Question form
  const [questionForm, setQuestionForm] = useState<Question>({
    content: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    points: 10
  })
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load instructor's courses
      const coursesRes = await apiClient.get('/courses?instructorId=' + user?.id)
      setCourses(coursesRes.data.courses || coursesRes.data || [])

      // Load quizzes
      const quizzesRes = await apiClient.get('/quizzes')
      setQuizzes(quizzesRes.data || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuiz = async () => {
    if (!formData.title || !formData.courseId) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const res = await apiClient.post('/quizzes', {
        ...formData,
        courseId: parseInt(formData.courseId)
      })
      setQuizzes([...quizzes, res.data])
      setIsCreateOpen(false)
      setFormData({ title: '', description: '', courseId: '', timeLimit: 30, passingScore: 70 })
      toast.success('Quiz created successfully!')
    } catch (error) {
      toast.error('Failed to create quiz')
    }
  }

  const handleDeleteQuiz = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return

    try {
      await apiClient.delete(`/quizzes/${id}`)
      setQuizzes(quizzes.filter(q => q.id !== id))
      toast.success('Quiz deleted')
    } catch (error) {
      toast.error('Failed to delete quiz')
    }
  }

  const handlePublishQuiz = async (quiz: Quiz) => {
    try {
      await apiClient.patch(`/quizzes/${quiz.id}`, { isPublished: !quiz.isPublished })
      setQuizzes(quizzes.map(q => q.id === quiz.id ? { ...q, isPublished: !q.isPublished } : q))

      if (!quiz.isPublished) {
        // Send notification to enrolled students
        await apiClient.post('/notifications/quiz-published', { quizId: quiz.id })
        toast.success('Quiz published! Students have been notified.')
      } else {
        toast.success('Quiz unpublished')
      }
    } catch (error) {
      toast.error('Failed to update quiz')
    }
  }

  const openQuestionsDialog = async (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    try {
      const res = await apiClient.get(`/quizzes/${quiz.id}`)
      setQuestions(res.data.questions || [])
      setIsQuestionsOpen(true)
    } catch (error) {
      toast.error('Failed to load questions')
    }
  }

  const handleAddQuestion = async () => {
    if (!questionForm.content || questionForm.options.some(o => !o)) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      if (editingQuestion?.id) {
        // Update existing question
        const res = await apiClient.patch(`/quizzes/questions/${editingQuestion.id}`, questionForm)
        setQuestions(questions.map(q => q.id === editingQuestion.id ? res.data : q))
        toast.success('Question updated')
      } else {
        // Add new question
        const res = await apiClient.post(`/quizzes/${selectedQuiz?.id}/questions`, questionForm)
        setQuestions([...questions, res.data])
        toast.success('Question added')
      }
      resetQuestionForm()
    } catch (error) {
      toast.error('Failed to save question')
    }
  }

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Delete this question?')) return

    try {
      await apiClient.delete(`/quizzes/questions/${id}`)
      setQuestions(questions.filter(q => q.id !== id))
      toast.success('Question deleted')
    } catch (error) {
      toast.error('Failed to delete question')
    }
  }

  const editQuestion = (question: Question) => {
    setEditingQuestion(question)
    setQuestionForm({
      content: question.content,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      points: question.points
    })
  }

  const resetQuestionForm = () => {
    setEditingQuestion(null)
    setQuestionForm({
      content: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 10
    })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...questionForm.options]
    newOptions[index] = value
    setQuestionForm({ ...questionForm, options: newOptions })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quiz Management</h1>
          <p className="text-muted-foreground mt-2">Create and manage quizzes for your courses</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
              <DialogDescription>Add a new quiz to one of your courses</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Quiz Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter quiz title"
                />
              </div>
              <div className="space-y-2">
                <Label>Course *</Label>
                <Select value={formData.courseId} onValueChange={(v) => setFormData({ ...formData, courseId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id.toString()}>{course.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Quiz description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateQuiz}>Create Quiz</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <FileQuestion className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{quizzes.length}</p>
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{quizzes.filter(q => q.isPublished).length}</p>
              <p className="text-sm text-muted-foreground">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{quizzes.filter(q => !q.isPublished).length}</p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{quizzes.reduce((acc, q) => acc + (q._count?.attempts || 0), 0)}</p>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quizzes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Quizzes</CardTitle>
          <CardDescription>Manage quizzes and add questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Time Limit</TableHead>
                <TableHead>Pass Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : quizzes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No quizzes yet. Create your first quiz!</TableCell>
                </TableRow>
              ) : (
                quizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.course?.title || 'N/A'}</TableCell>
                    <TableCell>{quiz.questions?.length || 0} questions</TableCell>
                    <TableCell>{quiz.timeLimit} min</TableCell>
                    <TableCell>{quiz.passingScore}%</TableCell>
                    <TableCell>
                      <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openQuestionsDialog(quiz)} title="Manage Questions">
                          <FileQuestion className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePublishQuiz(quiz)}
                          title={quiz.isPublished ? 'Unpublish' : 'Publish & Notify Students'}
                          className={quiz.isPublished ? 'text-yellow-600' : 'text-green-600'}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteQuiz(quiz.id)} title="Delete">
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

      {/* Questions Dialog */}
      <Dialog open={isQuestionsOpen} onOpenChange={setIsQuestionsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Questions - {selectedQuiz?.title}</DialogTitle>
            <DialogDescription>Add, edit, or remove questions from this quiz</DialogDescription>
          </DialogHeader>

          {/* Add/Edit Question Form */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{editingQuestion ? 'Edit Question' : 'Add New Question'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question *</Label>
                <Textarea
                  value={questionForm.content}
                  onChange={(e) => setQuestionForm({ ...questionForm, content: e.target.value })}
                  placeholder="Enter your question"
                />
              </div>
              <div className="space-y-2">
                <Label>Options *</Label>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={questionForm.correctAnswer === index}
                      onChange={() => setQuestionForm({ ...questionForm, correctAnswer: index })}
                    />
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {questionForm.correctAnswer === index && (
                      <Badge variant="default" className="bg-green-500">Correct</Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Explanation (shown after answer)</Label>
                  <Input
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    placeholder="Optional explanation"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddQuestion}>
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </Button>
                {editingQuestion && (
                  <Button variant="outline" onClick={resetQuestionForm}>Cancel Edit</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-2">
            <h4 className="font-semibold">Questions ({questions.length})</h4>
            {questions.length === 0 ? (
              <p className="text-muted-foreground">No questions added yet.</p>
            ) : (
              questions.map((question, index) => (
                <Card key={question.id || index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">Q{index + 1}: {question.content}</p>
                        <div className="mt-2 space-y-1">
                          {question.options.map((option, oIndex) => (
                            <p key={oIndex} className={`text-sm ${oIndex === question.correctAnswer ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                              {String.fromCharCode(65 + oIndex)}. {option} {oIndex === question.correctAnswer && '✓'}
                            </p>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Points: {question.points}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => editQuestion(question)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteQuestion(question.id!)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
