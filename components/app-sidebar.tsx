"use client"

import * as React from "react"
import {
  Box,
  Calendar,
  DollarSign,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Lightbulb,
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
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"

const navigation = {
  main: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
  ],
  crm: [
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
  ],
  projects: [
    {
      title: "Projetos",
      url: "/projetos",
      icon: FolderKanban,
    },
    {
      title: "Projetos Internos",
      url: "/projetos-internos",
      icon: Box,
    },
    {
      title: "Contratos",
      url: "/contratos",
      icon: FileText,
    },
  ],
  team: [
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
  ],
  finance: [
    {
      title: "Financeiro",
      url: "/financeiro",
      icon: DollarSign,
    },
  ],
  collaboration: [
    {
      title: "Sugestões",
      url: "/sugestoes",
      icon: Lightbulb,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const isActive = (url: string) =>
    pathname === url || (url !== "/" && pathname.startsWith(url))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-zinc-800/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/" className="group">
                {/* Logo Container */}
                <div className="relative flex aspect-square size-9 items-center justify-center">
                  {/* Border frame */}
                  <div className="absolute inset-0 border border-zinc-700 group-hover:border-zinc-500 transition-colors" />
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/0 group-hover:border-white/40 transition-colors" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/0 group-hover:border-white/40 transition-colors" />
                  {/* Letter */}
                  <span className="font-display text-base font-medium text-zinc-300 group-hover:text-white transition-colors">
                    H
                  </span>
                </div>
                {/* Brand text */}
                <div className="grid flex-1 text-left leading-tight">
                  <span className="font-display text-sm font-medium tracking-wide text-zinc-100">
                    Huntly
                  </span>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-500">
                    Admin
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            {navigation.main.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive(item.url)}
                  className="group relative"
                >
                  <Link href={item.url}>
                    <item.icon className="text-zinc-500 group-hover:text-white transition-colors" />
                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                      {item.title}
                    </span>
                    {/* Active indicator line */}
                    {isActive(item.url) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/80" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* CRM Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-normal px-3">
            CRM
          </SidebarGroupLabel>
          <SidebarMenu>
            {navigation.crm.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive(item.url)}
                  className="group relative"
                >
                  <Link href={item.url}>
                    <item.icon className="text-zinc-500 group-hover:text-white transition-colors" />
                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                      {item.title}
                    </span>
                    {isActive(item.url) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/80" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Projects Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-normal px-3">
            Projetos
          </SidebarGroupLabel>
          <SidebarMenu>
            {navigation.projects.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive(item.url)}
                  className="group relative"
                >
                  <Link href={item.url}>
                    <item.icon className="text-zinc-500 group-hover:text-white transition-colors" />
                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                      {item.title}
                    </span>
                    {isActive(item.url) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/80" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Team Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-normal px-3">
            Equipe
          </SidebarGroupLabel>
          <SidebarMenu>
            {navigation.team.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive(item.url)}
                  className="group relative"
                >
                  <Link href={item.url}>
                    <item.icon className="text-zinc-500 group-hover:text-white transition-colors" />
                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                      {item.title}
                    </span>
                    {isActive(item.url) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/80" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Finance Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-normal px-3">
            Financeiro
          </SidebarGroupLabel>
          <SidebarMenu>
            {navigation.finance.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive(item.url)}
                  className="group relative"
                >
                  <Link href={item.url}>
                    <item.icon className="text-zinc-500 group-hover:text-white transition-colors" />
                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                      {item.title}
                    </span>
                    {isActive(item.url) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/80" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Collaboration Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 font-normal px-3">
            Colaboração
          </SidebarGroupLabel>
          <SidebarMenu>
            {navigation.collaboration.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive(item.url)}
                  className="group relative"
                >
                  <Link href={item.url}>
                    <item.icon className="text-zinc-500 group-hover:text-white transition-colors" />
                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                      {item.title}
                    </span>
                    {isActive(item.url) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/80" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-800/50">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
