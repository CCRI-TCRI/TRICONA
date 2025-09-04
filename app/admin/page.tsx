import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EnhancedAdminDashboard } from "@/components/enhanced-admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/admin/login")
  }

  // Check if user is admin
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", user.email)
    .eq("is_active", true)
    .single()

  if (!adminUser) {
    redirect("/admin/login")
  }

  return <EnhancedAdminDashboard adminUser={adminUser} />
}
