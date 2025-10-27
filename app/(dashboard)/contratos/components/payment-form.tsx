"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { formatCurrencyInput } from "@/lib/utils/formatters"

interface PaymentFormData {
  installmentNumber: number
  amount: string
  dueDate: string
}

interface PaymentFormProps {
  payments: PaymentFormData[]
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, field: string, value: string | number) => void
}

function PaymentFormComponent({
  payments,
  onAdd,
  onRemove,
  onUpdate,
}: PaymentFormProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Parcelas de Pagamento</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
        >
          <Plus className="h-3 w-3 mr-1" />
          Adicionar Parcela
        </Button>
      </div>
      {payments.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
          {payments.map((payment, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="w-20">
                <Label className="text-xs">Parcela</Label>
                <Input
                  type="number"
                  placeholder="1"
                  min="1"
                  value={payment.installmentNumber}
                  onChange={(e) =>
                    onUpdate(index, "installmentNumber", parseInt(e.target.value))
                  }
                  className="h-9"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Valor</Label>
                <Input
                  placeholder="R$ 0,00"
                  value={formatCurrencyInput(payment.amount)}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, "")
                    onUpdate(index, "amount", rawValue)
                  }}
                  className="h-9"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Vencimento</Label>
                <Input
                  type="date"
                  value={payment.dueDate}
                  onChange={(e) => onUpdate(index, "dueDate", e.target.value)}
                  className="h-9"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="text-red-600 hover:text-red-700 h-9"
                title="Remover Parcela"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4 border rounded-md bg-gray-50">
          Nenhuma parcela adicionada. Clique em &quot;Adicionar Parcela&quot; para começar.
        </p>
      )}
    </div>
  )
}

export const PaymentForm = memo(PaymentFormComponent)

