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
import { Settings, Shield, Palette, Database, Save, RefreshCw, Calendar } from "lucide-react"

interface ElectionSettings {
  id: string
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
    id: "",
    election_name: "2024 Prefectorial Elections",
    start_date: "",
    end_date: "",
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
    { value: "new-year", label: "New Year" },
    { value: "valentine", label: "Valentine's Day" },
    { value: "easter", label: "Easter" },
    { value: "independence", label: "Independence Day" },
    { value: "thanksgiving", label: "Thanksgiving" },
  ]

  useEffect(() => {
    fetchSettings()
    checkDatabaseStatus()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("election_settings").select("*").single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setSettings(data)
      } else {
        // Create default settings if none exist
        await createDefaultSettings()
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
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

      if (error) throw error
      setSettings(data)
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
      const { error } = await supabase.from("election_settings").upsert([settings])

      if (error) throw error

      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = async () => {
    const defaultSettings = {
      ...settings,
      election_name: "2024 Prefectorial Elections",
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

    setSettings(defaultSettings)
    toast({
      title: "Reset",
      description: "Settings reset to defaults (not saved yet)",
    })
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
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure election and system settings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetToDefaults} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Database Connection</p>
              <p className="text-sm text-muted-foreground">Supabase connection status</p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  dbStatus === "connected"
                    ? "bg-green-500"
                    : dbStatus === "disconnected"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              />
              <span className="capitalize">{dbStatus}</span>
              <Button variant="ghost" size="sm" onClick={checkDatabaseStatus} disabled={dbStatus === "checking"}>
                <RefreshCw className={`w-4 h-4 ${dbStatus === "checking" ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="election" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="election">Election</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="election" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Election Configuration
              </CardTitle>
              <CardDescription>Configure basic election settings and timing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="election_name">Election Name</Label>
                <Input
                  id="election_name"
                  value={settings.election_name}
                  onChange={(e) => setSettings((prev) => ({ ...prev, election_name: e.target.value }))}
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
                    onChange={(e) => setSettings((prev) => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={settings.end_date}
                    onChange={(e) => setSettings((prev) => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Election Active</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable voting</p>
                </div>
                <Switch
                  id="is_active"
                  checked={settings.is_active}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, is_active: checked }))}
                />
              </div>

              <div>
                <Label htmlFor="max_votes">Max Votes Per User</Label>
                <Input
                  id="max_votes"
                  type="number"
                  min="1"
                  value={settings.max_votes_per_user}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, max_votes_per_user: Number.parseInt(e.target.value) }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show_results_live">Show Live Results</Label>
                  <p className="text-sm text-muted-foreground">Display results in real-time</p>
                </div>
                <Switch
                  id="show_results_live"
                  checked={settings.show_results_live}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, show_results_live: checked }))}
                />
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
              <CardDescription>Configure authentication and security features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow_face_recognition">Allow Face Recognition</Label>
                  <p className="text-sm text-muted-foreground">Enable facial recognition for authentication</p>
                </div>
                <Switch
                  id="allow_face_recognition"
                  checked={settings.allow_face_recognition}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, allow_face_recognition: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require_biometric">Require Biometric</Label>
                  <p className="text-sm text-muted-foreground">Make biometric authentication mandatory</p>
                </div>
                <Switch
                  id="require_biometric"
                  checked={settings.require_biometric}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, require_biometric: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance & Themes
              </CardTitle>
              <CardDescription>Customize the look and feel of the voting system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seasonal_theme">Seasonal Theme</Label>
                <Select
                  value={settings.seasonal_theme}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, seasonal_theme: value }))}
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
                <Label htmlFor="custom_greeting">Custom Greeting</Label>
                <Textarea
                  id="custom_greeting"
                  value={settings.custom_greeting}
                  onChange={(e) => setSettings((prev) => ({ ...prev, custom_greeting: e.target.value }))}
                  placeholder="Enter a custom greeting message..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="holiday_popups">Holiday Popups</Label>
                  <p className="text-sm text-muted-foreground">Show holiday-themed popups</p>
                </div>
                <Switch
                  id="holiday_popups"
                  checked={settings.holiday_popups_enabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, holiday_popups_enabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Feature Settings
              </CardTitle>
              <CardDescription>Enable or disable various system features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable_tutorial">Enable Tutorial</Label>
                  <p className="text-sm text-muted-foreground">Show tutorial popup for first-time users</p>
                </div>
                <Switch
                  id="enable_tutorial"
                  checked={settings.enable_tutorial}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, enable_tutorial: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
