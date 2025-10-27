"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Briefcase, Calendar, Shield } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatPhone } from "@/lib/utils/formatters"

interface UserProfile {
  id: string
  email: string
  member?: {
    id: string
    name: string
    role: string
    roles?: string
    phone?: string
    department?: string
    hireDate?: string
    avatar?: string
    bio?: string
    skills?: string
    status: string
  }
}

const roleLabels: Record<string, string> = {
  DEVELOPER: "Desenvolvedor",
  DESIGNER: "Designer",
  PROJECT_MANAGER: "Gerente de Projeto",
  PRODUCT_MANAGER: "Gerente de Produto",
  QA_ENGINEER: "Engenheiro de QA",
  DEVOPS: "DevOps",
  DATA_SCIENTIST: "Cientista de Dados",
  BUSINESS_ANALYST: "Analista de Negócios",
  FOUNDER: "Fundador",
  CEO: "CEO",
  CTO: "CTO",
  CFO: "CFO",
  OTHER: "Outro",
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  ON_LEAVE: "De Férias",
}

export default function PerfilPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess(false)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("As senhas não coincidem")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres")
      return
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordError(data.error || "Erro ao alterar senha")
        return
      }

      setPasswordSuccess(true)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      
      setTimeout(() => {
        setPasswordSuccess(false)
      }, 5000)
    } catch {
      setPasswordError("Erro ao conectar com o servidor")
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-gray-500">Erro ao carregar perfil</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-gray-600 mt-1">
            Visualize suas informações e gerencie sua conta
          </p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                {user.member?.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {user.member?.name || "Usuário"}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {user.member ? roleLabels[user.member.role] : "Membro da equipe"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {user.member && (
              <>
                {/* Status */}
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={
                        user.member.status === "ACTIVE"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }
                    >
                      {statusLabels[user.member.status]}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-500">Informações de Contato</Label>
                  
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span>{user.email}</span>
                  </div>

                  {user.member.phone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span>{formatPhone(user.member.phone)}</span>
                    </div>
                  )}
                </div>

                {(user.member.department || user.member.hireDate) && (
                  <>
                    <Separator />

                    {/* Work Information */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-500">Informações Profissionais</Label>
                      
                      {user.member.department && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Briefcase className="h-5 w-5 text-gray-400" />
                          <span>{user.member.department}</span>
                        </div>
                      )}

                      {user.member.hireDate && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span>
                            Na empresa desde {format(new Date(user.member.hireDate), "MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {user.member.roles && JSON.parse(user.member.roles).length > 1 && (
                  <>
                    <Separator />

                    {/* All Roles */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-500">Todos os Cargos</Label>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(user.member.roles).map((role: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {roleLabels[role]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {user.member.skills && (
                  <>
                    <Separator />

                    {/* Skills */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-500">Habilidades</Label>
                      <div className="flex flex-wrap gap-2">
                        {user.member.skills.split(",").map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {user.member.bio && (
                  <>
                    <Separator />

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">Bio</Label>
                      <p className="text-gray-700">{user.member.bio}</p>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Altere sua senha de acesso</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded text-sm">
                  Senha alterada com sucesso!
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    })
                    setPasswordError("")
                    setPasswordSuccess(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={changingPassword}>
                  {changingPassword ? "Alterando..." : "Alterar Senha"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

