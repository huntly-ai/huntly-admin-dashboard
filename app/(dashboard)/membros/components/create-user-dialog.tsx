"use client"

import { memo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateUserDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  memberName: string
  memberEmail: string
  password: string
  confirmPassword: string
  error: string
  onPasswordChange: (password: string) => void
  onConfirmPasswordChange: (confirmPassword: string) => void
  onSubmit: (e: React.FormEvent) => void
}

function CreateUserDialogComponent({
  isOpen,
  onOpenChange,
  memberName,
  memberEmail,
  password,
  confirmPassword,
  error,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: CreateUserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Usuário de Acesso</DialogTitle>
          <DialogDescription>
            Crie uma conta de acesso ao sistema para {memberName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={memberEmail}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              O email do membro será usado para login
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="userPassword">Senha</Label>
            <Input
              id="userPassword"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="userConfirmPassword">Confirmar Senha</Label>
            <Input
              id="userConfirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Criar Usuário
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const CreateUserDialog = memo(CreateUserDialogComponent)

