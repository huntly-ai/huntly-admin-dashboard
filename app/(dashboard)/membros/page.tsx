"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatPhone } from "@/lib/utils/formatters"
import { MembersList } from "./components/members-list"
import { MemberFormDialog } from "./components/member-form-dialog"
import { CreateUserDialog } from "./components/create-user-dialog"
import { MembersStats } from "./components/members-stats"

interface TeamMembership {
  id: string
  team: {
    id: string
    name: string
  }
}

interface Member {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  roles?: string
  status: string
  department?: string
  hireDate?: string
  avatar?: string
  bio?: string
  skills?: string
  notes?: string
  teamMemberships: TeamMembership[]
  createdAt: string
  user?: {
    id: string
    email: string
  }
  _count?: {
    projects: number
    teamMemberships: number
  }
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["DEVELOPER"])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "DEVELOPER",
    status: "ACTIVE",
    department: "",
    hireDate: "",
    bio: "",
    skills: "",
    notes: "",
  })
  
  // User creation dialog states
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [selectedMemberForUser, setSelectedMemberForUser] = useState<Member | null>(null)
  const [userPassword, setUserPassword] = useState("")
  const [userConfirmPassword, setUserConfirmPassword] = useState("")
  const [userError, setUserError] = useState("")

  const resetForm = useCallback(() => {
    setEditingMember(null)
    setSelectedRoles(["DEVELOPER"])
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "DEVELOPER",
      status: "ACTIVE",
      department: "",
      hireDate: "",
      bio: "",
      skills: "",
      notes: "",
    })
  }, [])

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/membros")
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingMember
        ? `/api/membros/${editingMember.id}`
        : "/api/membros"
      const method = editingMember ? "PUT" : "POST"

      const dataToSend = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ""),
        roles: JSON.stringify(selectedRoles),
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Erro ao salvar membro")
        return
      }

      await fetchMembers()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving member:", error)
      alert("Erro ao salvar membro")
    }
  }, [editingMember, formData, selectedRoles, fetchMembers, resetForm])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este membro?")) return

    try {
      const response = await fetch(`/api/membros/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        alert("Erro ao excluir membro")
        return
      }

      await fetchMembers()
    } catch (error) {
      console.error("Error deleting member:", error)
      alert("Erro ao excluir membro")
    }
  }, [fetchMembers])

  const handleEdit = useCallback((member: Member) => {
    setEditingMember(member)
    
    // Parse roles from JSON
    const memberRoles = member.roles ? JSON.parse(member.roles) : [member.role]
    setSelectedRoles(memberRoles)
    
    setFormData({
      name: member.name,
      email: member.email,
      phone: formatPhone(member.phone || ""),
      role: member.role,
      status: member.status,
      department: member.department || "",
      hireDate: member.hireDate ? member.hireDate.split("T")[0] : "",
      bio: member.bio || "",
      skills: member.skills || "",
      notes: member.notes || "",
    })
    setIsDialogOpen(true)
  }, [])
  
  const toggleRole = useCallback((role: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        // Don't allow removing the last role
        if (prev.length === 1) return prev
        return prev.filter(r => r !== role)
      }
      return [...prev, role]
    })
    
    // Update primary role if needed
    if (!selectedRoles.includes(formData.role)) {
      setFormData(prev => ({ ...prev, role: selectedRoles[0] || role }))
    }
  }, [selectedRoles, formData.role])
  
  const handleCreateUser = useCallback((member: Member) => {
    setSelectedMemberForUser(member)
    setUserPassword("")
    setUserConfirmPassword("")
    setUserError("")
    setIsUserDialogOpen(true)
  }, [])
  
  const handleUserSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setUserError("")
    
    if (!selectedMemberForUser) return
    
    if (userPassword !== userConfirmPassword) {
      setUserError("As senhas não coincidem")
      return
    }
    
    if (userPassword.length < 6) {
      setUserError("A senha deve ter pelo menos 6 caracteres")
      return
    }
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedMemberForUser.email,
          password: userPassword,
          memberId: selectedMemberForUser.id,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setUserError(data.error || "Erro ao criar usuário")
        return
      }
      
      setIsUserDialogOpen(false)
      fetchMembers() // Refresh to show user is now linked
      alert("Usuário criado com sucesso!")
    } catch {
      setUserError("Erro ao conectar com o servidor")
    }
  }, [selectedMemberForUser, userPassword, userConfirmPassword, fetchMembers])

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    if (field === "phone") {
      setFormData(prev => ({ ...prev, [field]: formatPhone(value) }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }, [])

  // Memoized filtered arrays
  const activeMembers = useMemo(
    () => members.filter(m => m.status === "ACTIVE"),
    [members]
  )
  
  const inactiveMembers = useMemo(
    () => members.filter(m => m.status !== "ACTIVE"),
    [members]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando membros...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Membros da Equipe</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os membros da equipe Huntly
            </p>
                </div>

          <MemberFormDialog
            isOpen={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
            editingMember={editingMember}
            formData={formData}
            selectedRoles={selectedRoles}
            onFormChange={handleFormChange}
            onRoleToggle={toggleRole}
            onSubmit={handleSubmit}
          />
          
          <CreateUserDialog
            isOpen={isUserDialogOpen}
            onOpenChange={setIsUserDialogOpen}
            memberName={selectedMemberForUser?.name || ""}
            memberEmail={selectedMemberForUser?.email || ""}
            password={userPassword}
            confirmPassword={userConfirmPassword}
            error={userError}
            onPasswordChange={setUserPassword}
            onConfirmPasswordChange={setUserConfirmPassword}
            onSubmit={handleUserSubmit}
                  />
                </div>
                
        <MembersStats
          totalMembers={members.length}
          activeMembers={activeMembers.length}
          inactiveMembers={inactiveMembers.length}
        />

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                Todos ({members.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Ativos ({activeMembers.length})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inativos ({inactiveMembers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <MembersList 
                members={members} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                onCreateUser={handleCreateUser}
              />
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <MembersList 
                members={activeMembers} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                onCreateUser={handleCreateUser}
              />
            </TabsContent>

            <TabsContent value="inactive" className="space-y-4">
              <MembersList 
                members={inactiveMembers} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                onCreateUser={handleCreateUser}
              />
            </TabsContent>
          </Tabs>
      </div>
    </>
  )
}
