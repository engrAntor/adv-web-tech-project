'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService, courseContentService } from '@/services/api.service';
import { Course, CourseContent, ContentType } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Plus,
  File,
  FileText,
  Video,
  ExternalLink,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  GripVertical,
  Upload,
  Loader2,
  BookOpen,
} from 'lucide-react';

export default function InstructorCourseContentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = Number(params.courseId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingContent, setEditingContent] = useState<CourseContent | null>(null);
  const [deleteContent, setDeleteContent] = useState<CourseContent | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: ContentType.PDF,
    externalUrl: '',
    duration: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseData, contentData] = await Promise.all([
        courseService.getById(courseId),
        courseContentService.getAllByCourse(courseId),
      ]);
      setCourse(courseData);
      setContents(contentData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load course content');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      contentType: ContentType.PDF,
      externalUrl: '',
      duration: '',
    });
    setSelectedFile(null);
    setEditingContent(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (content: CourseContent) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      description: content.description || '',
      contentType: content.contentType,
      externalUrl: content.externalUrl || '',
      duration: content.duration?.toString() || '',
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Auto-detect content type
      if (file.type === 'application/pdf') {
        setFormData(prev => ({ ...prev, contentType: ContentType.PDF }));
      } else if (file.type.startsWith('video/')) {
        setFormData(prev => ({ ...prev, contentType: ContentType.VIDEO }));
      } else {
        setFormData(prev => ({ ...prev, contentType: ContentType.DOCUMENT }));
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (formData.contentType === ContentType.LINK && !formData.externalUrl) {
      toast.error('URL is required for link type');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('contentType', formData.contentType);

      if (formData.externalUrl) {
        data.append('externalUrl', formData.externalUrl);
      }
      if (formData.duration) {
        data.append('duration', formData.duration);
      }
      if (selectedFile) {
        data.append('file', selectedFile);
      }

      if (editingContent) {
        await courseContentService.update(editingContent.id, data);
        toast.success('Content updated successfully');
      } else {
        await courseContentService.create(courseId, data);
        toast.success('Content added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(editingContent ? 'Failed to update content' : 'Failed to add content');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteContent) return;

    try {
      await courseContentService.delete(deleteContent.id);
      toast.success('Content deleted successfully');
      setDeleteContent(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete content');
      console.error(error);
    }
  };

  const handleTogglePublish = async (content: CourseContent) => {
    try {
      await courseContentService.togglePublish(content.id);
      toast.success(content.isPublished ? 'Content unpublished' : 'Content published');
      fetchData();
    } catch (error) {
      toast.error('Failed to update publish status');
      console.error(error);
    }
  };

  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case ContentType.PDF:
        return <File className="h-5 w-5 text-red-500" />;
      case ContentType.VIDEO:
        return <Video className="h-5 w-5 text-blue-500" />;
      case ContentType.DOCUMENT:
        return <FileText className="h-5 w-5 text-blue-600" />;
      case ContentType.LINK:
        return <ExternalLink className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Course not found</p>
        <Button asChild className="mt-4">
          <Link href="/instructor/quizzes">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Course Content</h1>
            <p className="text-muted-foreground">{course.title}</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingContent ? 'Edit Content' : 'Add New Content'}
              </DialogTitle>
              <DialogDescription>
                Upload PDFs, videos, or add external links for your students.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Chapter 1: Introduction"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this content..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) => setFormData({ ...formData, contentType: value as ContentType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ContentType.PDF}>PDF Document</SelectItem>
                    <SelectItem value={ContentType.VIDEO}>Video</SelectItem>
                    <SelectItem value={ContentType.DOCUMENT}>Other Document</SelectItem>
                    <SelectItem value={ContentType.LINK}>External Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.contentType !== ContentType.LINK && (
                <div className="space-y-2">
                  <Label>Upload File</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept={
                        formData.contentType === ContentType.PDF
                          ? '.pdf'
                          : formData.contentType === ContentType.VIDEO
                          ? 'video/*'
                          : '.pdf,.doc,.docx,.ppt,.pptx'
                      }
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <File className="h-5 w-5" />
                        <span className="text-sm">{selectedFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    )}
                    {editingContent?.fileName && !selectedFile && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Current file: {editingContent.fileName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {formData.contentType === ContentType.LINK && (
                <div className="space-y-2">
                  <Label htmlFor="externalUrl">External URL *</Label>
                  <Input
                    id="externalUrl"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}

              {formData.contentType === ContentType.VIDEO && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="30"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingContent ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingContent ? 'Update' : 'Add Content'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Materials ({contents.length})
          </CardTitle>
          <CardDescription>
            Manage your course readings, videos, and other materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contents.length > 0 ? (
            <div className="space-y-3">
              {contents.map((content, index) => (
                <div
                  key={content.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    !content.isPublished ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-3">
                      {getContentIcon(content.contentType)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{content.title}</h4>
                          {!content.isPublished && (
                            <Badge variant="secondary" className="text-xs">Draft</Badge>
                          )}
                        </div>
                        {content.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {content.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {content.contentType.toUpperCase()}
                          </Badge>
                          {content.fileSize && (
                            <span className="text-xs text-muted-foreground">
                              {(content.fileSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePublish(content)}
                      title={content.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {content.isPublished ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(content)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => setDeleteContent(content)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No content yet</h3>
              <p className="text-muted-foreground mb-4">
                Add PDFs, videos, or links for your students to access.
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Content
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteContent} onOpenChange={() => setDeleteContent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteContent?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
