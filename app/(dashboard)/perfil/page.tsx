"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone, Briefcase, Calendar, Shield, User } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatPhone } from "@/lib/utils/formatters"
import {
  SectionHeader,
  HuntlyCard,
  HuntlyCardHeader,
  HuntlyCardContent,
  HuntlyLoading,
} from "@/components/huntly-ui"
import { memberRoleLabels, memberStatusColors, memberStatusLabels, alertStyles } from "@/lib/design-tokens"

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

export default function PerfilPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
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
    return <HuntlyLoading text="Carregando perfil..." />
  }

  if (!user) {
    return (
      <HuntlyCard>
        <HuntlyCardContent className="p-8">
          <p className="text-center text-muted-foreground">Erro ao carregar perfil</p>
        </HuntlyCardContent>
      </HuntlyCard>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <SectionHeader
        label="Conta"
        title="Meu"
        titleBold="Perfil"
      />

      {/* Profile Information */}
      <HuntlyCard>
        <HuntlyCardHeader
          title="Informações Pessoais"
          description="Seus dados de perfil e informações de contato"
        />
        <HuntlyCardContent className="p-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-20 w-20 bg-muted border border-border flex items-center justify-center text-foreground font-display text-2xl">
              {user.member?.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                {user.member?.name || "Usuário"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user.member ? memberRoleLabels[user.member.role] || user.member.role : "Membro da equipe"}
              </p>
            </div>
          </div>

          {user.member && (
            <div className="space-y-6">
              {/* Status */}
              <div className="pb-6 border-b border-border/50">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70 mb-3">Status</p>
                <span className={`inline-flex items-center px-2.5 py-1 text-xs ${memberStatusColors[user.member.status]}`}>
                  {memberStatusLabels[user.member.status]}
                </span>
              </div>

              {/* Contact Information */}
              <div className="pb-6 border-b border-border/50">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70 mb-4">Informações de Contato</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground dark:text-zinc-400">
                    <Mail className="h-4 w-4 text-muted-foreground/70" />
                    <span>{user.email}</span>
                  </div>
                  {user.member.phone && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground dark:text-zinc-400">
                      <Phone className="h-4 w-4 text-muted-foreground/70" />
                      <span>{formatPhone(user.member.phone)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Information */}
              {(user.member.department || user.member.hireDate) && (
                <div className="pb-6 border-b border-border/50">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70 mb-4">Informações Profissionais</p>
                  <div className="space-y-3">
                    {user.member.department && (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground dark:text-zinc-400">
                        <Briefcase className="h-4 w-4 text-muted-foreground/70" />
                        <span>{user.member.department}</span>
                      </div>
                    )}
                    {user.member.hireDate && (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground dark:text-zinc-400">
                        <Calendar className="h-4 w-4 text-muted-foreground/70" />
                        <span>
                          Na empresa desde {format(new Date(user.member.hireDate), "MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* All Roles */}
              {user.member.roles && JSON.parse(user.member.roles).length > 1 && (
                <div className="pb-6 border-b border-border/50">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70 mb-4">Todos os Cargos</p>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(user.member.roles).map((role: string, index: number) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 text-xs border border-border text-muted-foreground dark:text-zinc-400"
                      >
                        {memberRoleLabels[role] || role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {user.member.skills && (
                <div className="pb-6 border-b border-border/50">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70 mb-4">Habilidades</p>
                  <div className="flex flex-wrap gap-2">
                    {user.member.skills.split(",").map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 text-xs bg-muted/50 border border-border/50 text-muted-foreground dark:text-zinc-400"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {user.member.bio && (
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/70 mb-4">Bio</p>
                  <p className="text-sm text-muted-foreground dark:text-zinc-400 leading-relaxed">{user.member.bio}</p>
                </div>
              )}
            </div>
          )}
        </HuntlyCardContent>
      </HuntlyCard>

      {/* Change Password */}
      <HuntlyCard>
        <HuntlyCardHeader
          title={
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <span>Segurança</span>
            </div>
          }
          description="Altere sua senha de acesso"
        />
        <HuntlyCardContent className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-6">
            {passwordError && (
              <div className={`px-4 py-3 text-sm ${alertStyles.error}`}>
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className={`px-4 py-3 text-sm ${alertStyles.success}`}>
                Senha alterada com sucesso!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-xs text-muted-foreground dark:text-zinc-400">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/70 focus:border-border focus:ring-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-xs text-muted-foreground dark:text-zinc-400">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/70 focus:border-border focus:ring-zinc-700"
              />
              <p className="text-[10px] text-muted-foreground/70">Mínimo de 6 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground dark:text-zinc-400">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/70 focus:border-border focus:ring-zinc-700"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  })
                  setPasswordError("")
                  setPasswordSuccess(false)
                }}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-white text-black hover:bg-zinc-200 font-medium"
              >
                <User className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
            </div>
          </form>
        </HuntlyCardContent>
      </HuntlyCard>
    </div>
  )
}
