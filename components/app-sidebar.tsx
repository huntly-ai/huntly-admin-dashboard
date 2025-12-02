"use client"

import * as React from "react"
import {
  Calendar,
  DollarSign,
  FileText,
  FolderKanban,
  LayoutDashboard,
  UserCog,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Leads",
      url: "/leads",
      icon: UserPlus,
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: Users,
    },
    {
      title: "Projetos",
      url: "/projetos",
      icon: FolderKanban,
    },
    {
      title: "Contratos",
      url: "/contratos",
      icon: FileText,
    },
    {
      title: "Reuniões",
      url: "/reunioes",
      icon: Calendar,
    },
    {
      title: "Membros",
      url: "/membros",
      icon: UserCog,
    },
    {
      title: "Times",
      url: "/times",
      icon: UsersRound,
    },
    {
      title: "Financeiro",
      url: "/financeiro",
      icon: DollarSign,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sidebar-primary-foreground">
                    <LayoutDashboard className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Huntly</span>
                    <span className="truncate text-xs">Admin Dashboard</span>
                    </div>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title} 
                isActive={pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))}
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

