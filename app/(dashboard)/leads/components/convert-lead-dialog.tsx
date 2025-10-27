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
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle>Converter Lead em Cliente</DialogTitle>
              <DialogDescription>
                Confirme a conversão deste lead para cliente
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-700">
            Você está prestes a converter o seguinte lead em um cliente:
          </p>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg space-y-3 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {lead.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{lead.name}</h3>
                {lead.company && (
                  <p className="text-sm text-gray-600">{lead.company}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 pl-13">
              {lead.email && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{lead.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{formatPhone(lead.phone)}</span>
              </div>
              {lead.position && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span>{lead.position}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>O que acontecerá:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
              <li>Um novo cliente será criado com estes dados</li>
              <li>O status do lead será atualizado para &quot;Ganho&quot;</li>
              <li>Você poderá criar projetos para este novo cliente</li>
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
            className="bg-green-600 hover:bg-green-700"
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

