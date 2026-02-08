import { requireUserWithProfile } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireUserWithProfile();
  const fullName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || null
    : null;
  const sidebarUser = {
    name: fullName ?? user.user_metadata?.full_name ?? user.email ?? "User",
    email: user.email ?? "",
    avatar: user.user_metadata?.avatar_url ?? "",
  };
  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}