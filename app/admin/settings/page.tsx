"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Settings, Shield, Palette, Database, Save, RefreshCw } from "lucide-react"

interface ElectionSettings {
  id?: string
  election_name: string
  start_date: string
  end_date: string
  is_active: boolean
  allow_face_recognition: boolean
  require_biometric: boolean
  max_votes_per_user: number
  show_results_live: boolean
  enable_tutorial: boolean
  seasonal_theme: string
  custom_greeting: string
  holiday_popups_enabled: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ElectionSettings>({
    election_name: "2024 Prefectorial Elections",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    is_active: true,
    allow_face_recognition: true,
    require_biometric: false,
    max_votes_per_user: 1,
    show_results_live: false,
    enable_tutorial: true,
    seasonal_theme: "default",
    custom_greeting: "",
    holiday_popups_enabled: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dbStatus, setDbStatus] = useState<"connected" | "disconnected" | "checking">("checking")

  const seasonalThemes = [
    { value: "default", label: "Default" },
    { value: "halloween", label: "Halloween" },
    { value: "christmas", label: "Christmas" },
    { value: "july4th", label: "July 4th" },
    { value: "valentine", label: "Valentine's Day" },
    { value: "pride", label: "Pride Month" },
  ]

  useEffect(() => {
    fetchSettings()
    checkDatabaseStatus()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("election_settings").select("*").single()

      if (error && error.code !== "PGRST116") {
        console.error("Supabase settings error:", error)
        toast({
          title: "Demo Mode",
          description: "Using default settings. Database connection failed.",
          variant: "destructive",
        })
      } else if (data) {
        setSettings(data)
      } else {
        // Create default settings if none exist
        await createDefaultSettings()
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Demo Mode",
        description: "Using default settings",
      })
    } finally {
      setLoading(false)
    }
  }

  const createDefaultSettings = async () => {
    try {
      const defaultSettings = {
        election_name: "2024 Prefectorial Elections",
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        is_active: true,
        allow_face_recognition: true,
        require_biometric: false,
        max_votes_per_user: 1,
        show_results_live: false,
        enable_tutorial: true,
        seasonal_theme: "default",
        custom_greeting: "",
        holiday_popups_enabled: true,
      }

      const { data, error } = await supabase.from("election_settings").insert([defaultSettings]).select().single()

      if (error) {
        console.error("Error creating default settings:", error)
      } else {
        setSettings(data)
      }
    } catch (error) {
      console.error("Error creating default settings:", error)
    }
  }

  const checkDatabaseStatus = async () => {
    try {
      const { error } = await supabase.from("users").select("id").limit(1)
      setDbStatus(error ? "disconnected" : "connected")
    } catch (error) {
      setDbStatus("disconnected")
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      let savedSuccessfully = false

      if (settings.id) {
        // Update existing settings
        const { error } = await supabase.from("election_settings").update(settings).eq("id", settings.id)

        if (error) {
          console.error("Supabase update error:", error)
        } else {
          savedSuccessfully = true
        }
      } else {
        // Create new settings
        const { data, error } = await supabase.from("election_settings").insert([settings]).select().single()

        if (error) {
          console.error("Supabase insert error:", error)
        } else {
          setSettings(data)
          savedSuccessfully = true
        }
      }

      // Always save to localStorage as backup
      localStorage.setItem("election_settings", JSON.stringify(settings))

      if (savedSuccessfully) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
      } else {
        toast({
          title: "Demo Mode",
          description: "Settings saved locally (not saved to database)",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      // Save to localStorage as fallback
      localStorage.setItem("election_settings", JSON.stringify(settings))
      toast({
        title: "Demo Mode",
        description: "Settings saved locally",
      })
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = () => {
    setSettings({
      election_name: "2024 Prefectorial Elections",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      is_active: true,
      allow_face_recognition: true,
      require_biometric: false,
      max_votes_per_user: 1,
      show_results_live: false,
      enable_tutorial: true,
      seasonal_theme: "default",
      custom_greeting: "",
      holiday_popups_enabled: true,
    })
    toast({
      title: "Reset",
      description: "Settings reset to defaults",
    })
  }

  const updateSetting = (key: keyof ElectionSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Election Settings</h1>
          <p className="text-muted-foreground">Configure election parameters and system settings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetToDefaults} variant="outline" disabled={saving}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                dbStatus === "connected"
                  ? "bg-green-500"
                  : dbStatus === "disconnected"
                    ? "bg-red-500"
                    : "bg-yellow-500 animate-pulse"
              }`}
            />
            <span className="font-medium">
              {dbStatus === "connected"
                ? "Connected to Supabase"
                : dbStatus === "disconnected"
                  ? "Disconnected - Using Demo Mode"
                  : "Checking connection..."}
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic election configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="election_name">Election Name</Label>
                <Input
                  id="election_name"
                  value={settings.election_name}
                  onChange={(e) => updateSetting("election_name", e.target.value)}
                  placeholder="Enter election name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={settings.start_date}
                    onChange={(e) => updateSetting("start_date", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={settings.end_date}
                    onChange={(e) => updateSetting("end_date", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={settings.is_active}
                  onCheckedChange={(checked) => updateSetting("is_active", checked)}
                />
                <Label htmlFor="is_active">Election is Active</Label>
              </div>
              <div>
                <Label htmlFor="max_votes">Maximum Votes per User</Label>
                <Select
                  value={settings.max_votes_per_user.toString()}
                  onValueChange={(value) => updateSetting("max_votes_per_user", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Vote</SelectItem>
                    <SelectItem value="2">2 Votes</SelectItem>
                    <SelectItem value="3">3 Votes</SelectItem>
                    <SelectItem value="5">5 Votes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Authentication and security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow_face_recognition"
                  checked={settings.allow_face_recognition}
                  onCheckedChange={(checked) => updateSetting("allow_face_recognition", checked)}
                />
                <Label htmlFor="allow_face_recognition">Enable Face Recognition</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="require_biometric"
                  checked={settings.require_biometric}
                  onCheckedChange={(checked) => updateSetting("require_biometric", checked)}
                />
                <Label htmlFor="require_biometric">Require Biometric Authentication</Label>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Security Notes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Face recognition helps prevent duplicate voting</li>
                  <li>• Biometric authentication adds an extra layer of security</li>
                  <li>• All biometric data is processed locally and not stored</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seasonal_theme">Seasonal Theme</Label>
                <Select
                  value={settings.seasonal_theme}
                  onValueChange={(value) => updateSetting("seasonal_theme", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {seasonalThemes.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="custom_greeting">Custom Greeting Message</Label>
                <Textarea
                  id="custom_greeting"
                  value={settings.custom_greeting}
                  onChange={(e) => updateSetting("custom_greeting", e.target.value)}
                  placeholder="Enter a custom greeting message for voters..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="holiday_popups"
                  checked={settings.holiday_popups_enabled}
                  onCheckedChange={(checked) => updateSetting("holiday_popups_enabled", checked)}
                />
                <Label htmlFor="holiday_popups">Enable Holiday Popups</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Settings</CardTitle>
              <CardDescription>Enable or disable specific features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show_results_live"
                  checked={settings.show_results_live}
                  onCheckedChange={(checked) => updateSetting("show_results_live", checked)}
                />
                <Label htmlFor="show_results_live">Show Live Results</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enable_tutorial"
                  checked={settings.enable_tutorial}
                  onCheckedChange={(checked) => updateSetting("enable_tutorial", checked)}
                />
                <Label htmlFor="enable_tutorial">Enable Tutorial for New Users</Label>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Feature Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Live results show vote counts in real-time</li>
                  <li>• Tutorial helps new users understand the voting process</li>
                  <li>• Features can be toggled during an active election</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
