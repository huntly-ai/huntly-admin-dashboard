"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FolderKanban, 
  DollarSign,
  FileText,
  UserCog,
  UsersRound,
  Menu,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    href: "/leads",
    icon: UserPlus,
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    title: "Projetos",
    href: "/projetos",
    icon: FolderKanban,
  },
  {
    title: "Contratos",
    href: "/contratos",
    icon: FileText,
  },
  {
    title: "Reuniões",
    href: "/reunioes",
    icon: Calendar,
  },
  {
    title: "Membros",
    href: "/membros",
    icon: UserCog,
  },
  {
    title: "Times",
    href: "/times",
    icon: UsersRound,
  },
  {
    title: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
  },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Navigation */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-gray-900 text-white">
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Huntly
          </h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
          </div>
        </nav>
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Huntly
        </h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-gray-900 border-gray-800 p-0">
            <div className="flex items-center justify-center h-16 border-b border-gray-800">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Huntly
              </h1>
            </div>
            <nav className="py-4">
              <div className="space-y-1 px-3">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  )
                })}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

