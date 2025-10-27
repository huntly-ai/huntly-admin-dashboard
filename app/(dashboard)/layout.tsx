import { Nav } from "@/components/nav"
import { UserMenu } from "@/components/user-menu"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Nav />
        
        {/* Top Header with User Menu */}
        <div className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white border-b border-gray-200 z-10 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Huntly Dashboard
          </h1>
          <UserMenu />
        </div>
        
        <main className="md:pl-64 pt-16">
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

