"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Calendar,
  Clock,
  Shield,
  Palette,
  Bell,
  Database,
  Save,
  RefreshCw,
  Globe,
  Lock,
  Eye,
  Users,
} from "lucide-react"

interface ElectionSettings {
  election_name: string
  election_description: string
  start_date: string
  end_date: string
  voting_duration_minutes: number
  is_active: boolean
  allow_face_recognition: boolean
  require_face_recognition: boolean
  show_live_results: boolean
  allow_vote_changes: boolean
  max_candidates_per_position: number
  notification_email: string
}

interface SeasonalSettings {
  enable_seasonal_themes: boolean
  current_theme: string
  show_holiday_popups: boolean
  show_tutorial_popup: boolean
  custom_greeting: string
}

export default function SettingsPage() {
  const [electionSettings, setElectionSettings] = useState<ElectionSettings>({
    election_name: "Lubiri Secondary School Elections 2024",
    election_description: "Annual student leadership elections",
    start_date: "2024-02-01T08:00",
    end_date: "2024-02-01T16:00",
    voting_duration_minutes: 2,
    is_active: true,
    allow_face_recognition: true,
    require_face_recognition: false,
    show_live_results: true,
    allow_vote_changes: false,
    max_candidates_per_position: 5,
    notification_email: "admin@lubiri.edu.ug",
  })

  const [seasonalSettings, setSeasonalSettings] = useState<SeasonalSettings>({
    enable_seasonal_themes: true,
    current_theme: "default",
    show_holiday_popups: true,
    show_tutorial_popup: true,
    custom_greeting: "",
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSaveElectionSettings = async () => {
    setLoading(true)
    try {
      // In production, save to Supabase
      // await supabase.from('election_settings').upsert(electionSettings)

      // Mock save for demo
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSeasonalSettings = async () => {
    setLoading(true)
    try {
      // In production, save to Supabase
      // await supabase.from('seasonal_settings').upsert(seasonalSettings)

      // Mock save for demo
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Error saving seasonal settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const themes = [
    { value: "default", label: "Default" },
    { value: "fourth-of-july", label: "Fourth of July" },
    { value: "halloween", label: "Halloween" },
    { value: "christmas", label: "Christmas" },
    { value: "newyear", label: "New Year" },
    { value: "valentine", label: "Valentine's Day" },
    { value: "pride", label: "Pride Month" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">System Settings</h2>
          <p className="text-gray-600">Configure election parameters and system preferences</p>
        </div>
        <div className="flex gap-2">
          {saved && (
            <Badge variant="default" className="bg-green-500">
              <Save className="w-3 h-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="election" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="election" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Election
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Seasonal
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Election Settings */}
        <TabsContent value="election">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Election Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="election_name">Election Name</Label>
                  <Input
                    id="election_name"
                    value={electionSettings.election_name}
                    onChange={(e) => setElectionSettings((prev) => ({ ...prev, election_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="election_description">Description</Label>
                  <Textarea
                    id="election_description"
                    value={electionSettings.election_description}
                    onChange={(e) => setElectionSettings((prev) => ({ ...prev, election_description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="notification_email">Notification Email</Label>
                  <Input
                    id="notification_email"
                    type="email"
                    value={electionSettings.notification_email}
                    onChange={(e) => setElectionSettings((prev) => ({ ...prev, notification_email: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timing & Duration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="start_date">Start Date & Time</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={electionSettings.start_date}
                    onChange={(e) => setElectionSettings((prev) => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date & Time</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={electionSettings.end_date}
                    onChange={(e) => setElectionSettings((prev) => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="voting_duration">Voting Duration (minutes)</Label>
                  <Input
                    id="voting_duration"
                    type="number"
                    min="1"
                    max="60"
                    value={electionSettings.voting_duration_minutes}
                    onChange={(e) =>
                      setElectionSettings((prev) => ({
                        ...prev,
                        voting_duration_minutes: Number.parseInt(e.target.value),
                      }))
                    }
                  />
                  <p className="text-sm text-gray-500 mt-1">Time limit for each voter to complete their ballot</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Voting Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Election Active</Label>
                    <p className="text-sm text-gray-500">Enable voting for students</p>
                  </div>
                  <Switch
                    checked={electionSettings.is_active}
                    onCheckedChange={(checked) => setElectionSettings((prev) => ({ ...prev, is_active: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Live Results</Label>
                    <p className="text-sm text-gray-500">Display real-time vote counts</p>
                  </div>
                  <Switch
                    checked={electionSettings.show_live_results}
                    onCheckedChange={(checked) =>
                      setElectionSettings((prev) => ({ ...prev, show_live_results: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Vote Changes</Label>
                    <p className="text-sm text-gray-500">Let voters modify their selections</p>
                  </div>
                  <Switch
                    checked={electionSettings.allow_vote_changes}
                    onCheckedChange={(checked) =>
                      setElectionSettings((prev) => ({ ...prev, allow_vote_changes: checked }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="max_candidates">Max Candidates per Position</Label>
                  <Input
                    id="max_candidates"
                    type="number"
                    min="1"
                    max="20"
                    value={electionSettings.max_candidates_per_position}
                    onChange={(e) =>
                      setElectionSettings((prev) => ({
                        ...prev,
                        max_candidates_per_position: Number.parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSaveElectionSettings} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Election Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Face Recognition</Label>
                    <p className="text-sm text-gray-500">Enable biometric authentication</p>
                  </div>
                  <Switch
                    checked={electionSettings.allow_face_recognition}
                    onCheckedChange={(checked) =>
                      setElectionSettings((prev) => ({ ...prev, allow_face_recognition: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Face Recognition</Label>
                    <p className="text-sm text-gray-500">Make biometric auth mandatory</p>
                  </div>
                  <Switch
                    checked={electionSettings.require_face_recognition}
                    onCheckedChange={(checked) =>
                      setElectionSettings((prev) => ({ ...prev, require_face_recognition: checked }))
                    }
                    disabled={!electionSettings.allow_face_recognition}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Security Features</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• End-to-end vote encryption</li>
                    <li>• Anonymous ballot casting</li>
                    <li>• Audit trail logging</li>
                    <li>• Secure voter authentication</li>
                  </ul>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  View Security Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Seasonal Settings */}
        <TabsContent value="seasonal">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Theme Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Seasonal Themes</Label>
                    <p className="text-sm text-gray-500">Automatically change themes for holidays</p>
                  </div>
                  <Switch
                    checked={seasonalSettings.enable_seasonal_themes}
                    onCheckedChange={(checked) =>
                      setSeasonalSettings((prev) => ({ ...prev, enable_seasonal_themes: checked }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="current_theme">Current Theme</Label>
                  <Select
                    value={seasonalSettings.current_theme}
                    onValueChange={(value) => setSeasonalSettings((prev) => ({ ...prev, current_theme: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="custom_greeting">Custom Greeting</Label>
                  <Input
                    id="custom_greeting"
                    value={seasonalSettings.custom_greeting}
                    onChange={(e) => setSeasonalSettings((prev) => ({ ...prev, custom_greeting: e.target.value }))}
                    placeholder="Enter custom welcome message"
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave empty to use seasonal greetings</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Popup Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Holiday Popups</Label>
                    <p className="text-sm text-gray-500">Display holiday-themed messages</p>
                  </div>
                  <Switch
                    checked={seasonalSettings.show_holiday_popups}
                    onCheckedChange={(checked) =>
                      setSeasonalSettings((prev) => ({ ...prev, show_holiday_popups: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Tutorial Popup</Label>
                    <p className="text-sm text-gray-500">Display voting tutorial for new users</p>
                  </div>
                  <Switch
                    checked={seasonalSettings.show_tutorial_popup}
                    onCheckedChange={(checked) =>
                      setSeasonalSettings((prev) => ({ ...prev, show_tutorial_popup: checked }))
                    }
                  />
                </div>
                <Button onClick={handleSaveSeasonalSettings} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Seasonal Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Connection Status</span>
                  <Badge variant="default" className="bg-green-500">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Records</span>
                  <Badge variant="outline">1,247</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Backup</span>
                  <Badge variant="outline">2 hours ago</Badge>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Database className="w-4 h-4 mr-2" />
                  Create Backup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Version</span>
                  <Badge variant="outline">v2.1.0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Environment</span>
                  <Badge variant="outline">Production</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Uptime</span>
                  <Badge variant="outline">7 days</Badge>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  System Health Check
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
