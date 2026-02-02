"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Mail,
  Bell,
  Shield,
  Database,
  Globe,
  Palette,
  Save,
  RotateCcw
} from "lucide-react"
import { toast } from "sonner"

export default function SystemSettingsPage() {
  const [saving, setSaving] = useState(false)

  // General Settings
  const [siteName, setSiteName] = useState('LMS Platform')
  const [siteDescription, setSiteDescription] = useState('A modern learning management system')
  const [contactEmail, setContactEmail] = useState('engr.antor.3@gmail.com')
  const [contactPhone, setContactPhone] = useState('+880 1832-814129')

  // Email Settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [welcomeEmail, setWelcomeEmail] = useState(true)
  const [enrollmentEmail, setEnrollmentEmail] = useState(true)
  const [certificateEmail, setCertificateEmail] = useState(true)

  // Security Settings
  const [requireEmailVerification, setRequireEmailVerification] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState('24')
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5')
  const [enableTwoFactor, setEnableTwoFactor] = useState(false)

  // Course Settings
  const [allowSelfEnrollment, setAllowSelfEnrollment] = useState(true)
  const [requireApproval, setRequireApproval] = useState(false)
  const [defaultCourseVisibility, setDefaultCourseVisibility] = useState('public')
  const [enableRatings, setEnableRatings] = useState(true)

  // Appearance Settings
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [darkModeDefault, setDarkModeDefault] = useState(false)
  const [showFooter, setShowFooter] = useState(true)

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Settings saved successfully')
    setSaving(false)
  }

  const handleReset = () => {
    toast.info('Settings reset to defaults')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure platform settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <Database className="h-4 w-4" /> Courses
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" /> Appearance
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure email notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Welcome Email</Label>
                    <p className="text-sm text-muted-foreground">Send welcome email to new users</p>
                  </div>
                  <Switch
                    checked={welcomeEmail}
                    onCheckedChange={setWelcomeEmail}
                    disabled={!emailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enrollment Confirmation</Label>
                    <p className="text-sm text-muted-foreground">Send email when user enrolls in a course</p>
                  </div>
                  <Switch
                    checked={enrollmentEmail}
                    onCheckedChange={setEnrollmentEmail}
                    disabled={!emailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Certificate Notification</Label>
                    <p className="text-sm text-muted-foreground">Send email when certificate is issued</p>
                  </div>
                  <Switch
                    checked={certificateEmail}
                    onCheckedChange={setCertificateEmail}
                    disabled={!emailNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Users must verify email before accessing platform</p>
                  </div>
                  <Switch
                    checked={requireEmailVerification}
                    onCheckedChange={setRequireEmailVerification}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Allow users to enable 2FA</p>
                  </div>
                  <Switch
                    checked={enableTwoFactor}
                    onCheckedChange={setEnableTwoFactor}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Session Timeout (hours)</Label>
                    <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="8">8 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="72">72 hours</SelectItem>
                        <SelectItem value="168">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Login Attempts</Label>
                    <Select value={maxLoginAttempts} onValueChange={setMaxLoginAttempts}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="10">10 attempts</SelectItem>
                        <SelectItem value="0">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course Settings */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>Configure course-related settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Self-Enrollment</Label>
                    <p className="text-sm text-muted-foreground">Users can enroll in courses themselves</p>
                  </div>
                  <Switch
                    checked={allowSelfEnrollment}
                    onCheckedChange={setAllowSelfEnrollment}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Enrollment Approval</Label>
                    <p className="text-sm text-muted-foreground">Admin must approve enrollments</p>
                  </div>
                  <Switch
                    checked={requireApproval}
                    onCheckedChange={setRequireApproval}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Course Ratings</Label>
                    <p className="text-sm text-muted-foreground">Allow users to rate courses</p>
                  </div>
                  <Switch
                    checked={enableRatings}
                    onCheckedChange={setEnableRatings}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Course Visibility</Label>
                  <Select value={defaultCourseVisibility} onValueChange={setDefaultCourseVisibility}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the platform appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode by Default</Label>
                    <p className="text-sm text-muted-foreground">Use dark mode as the default theme</p>
                  </div>
                  <Switch
                    checked={darkModeDefault}
                    onCheckedChange={setDarkModeDefault}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Footer</Label>
                    <p className="text-sm text-muted-foreground">Display footer on all pages</p>
                  </div>
                  <Switch
                    checked={showFooter}
                    onCheckedChange={setShowFooter}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
