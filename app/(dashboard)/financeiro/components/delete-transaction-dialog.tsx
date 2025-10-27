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
import { AlertCircle } from "lucide-react"

interface DeleteTransactionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  transaction: { description: string; amount: number; type: string } | null
  onConfirm: () => void
}

function DeleteTransactionDialogComponent({
  isOpen,
  onOpenChange,
  transaction,
  onConfirm,
}: DeleteTransactionDialogProps) {
  if (!transaction) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>Excluir Transação</DialogTitle>
              <DialogDescription>Esta ação não pode ser desfeita</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-700">
            Tem certeza que deseja excluir esta transação?
          </p>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div>
              <span className="text-xs text-gray-500">Descrição:</span>
              <p className="font-medium">{transaction.description}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Valor:</span>
              <p
                className={`font-bold ${
                  transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                }`}
              >
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(transaction.amount)}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Tipo:</span>
              <p className="font-medium">
                {transaction.type === "INCOME" ? "Receita" : "Despesa"}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Esta transação será removida permanentemente do sistema.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Sim, Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const DeleteTransactionDialog = memo(DeleteTransactionDialogComponent)

