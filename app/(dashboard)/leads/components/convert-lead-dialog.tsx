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
import { UserCheck, Mail, Phone, Briefcase } from "lucide-react"
import { formatPhone } from "@/lib/utils/formatters"
import { getAvatarColor, alertStyles } from "@/lib/design-tokens"

interface Lead {
  id: string
  name: string
  email?: string
  phone: string
  company?: string
  position?: string
}

interface ConvertLeadDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead | null
  onConfirm: () => void
}

function ConvertLeadDialogComponent({
  isOpen,
  onOpenChange,
  lead,
  onConfirm,
}: ConvertLeadDialogProps) {
  if (!lead) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-md bg-green-950 border border-green-800 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-foreground">Converter Lead em Cliente</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Confirme a conversao deste lead para cliente
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Voce esta prestes a converter o seguinte lead em um cliente:
          </p>

          <div className="bg-secondary p-4 rounded-lg space-y-3 border border-border">
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 rounded-md flex items-center justify-center font-bold ${getAvatarColor(lead.name)}`}>
                {lead.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">{lead.name}</h3>
                {lead.company && (
                  <p className="text-sm text-muted-foreground">{lead.company}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 pl-13">
              {lead.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{lead.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{formatPhone(lead.phone)}</span>
              </div>
              {lead.position && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{lead.position}</span>
                </div>
              )}
            </div>
          </div>

          <div className={`${alertStyles.info} rounded-lg p-3`}>
            <p className="text-sm font-medium">
              O que acontecera:
            </p>
            <ul className="text-sm mt-2 space-y-1 ml-4 list-disc opacity-90">
              <li>Um novo cliente sera criado com estes dados</li>
              <li>O status do lead sera atualizado para &quot;Ganho&quot;</li>
              <li>Voce podera criar projetos para este novo cliente</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Converter em Cliente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const ConvertLeadDialog = memo(ConvertLeadDialogComponent)
