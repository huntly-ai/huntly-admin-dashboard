"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { prepareValueForCurrencyInput } from "@/lib/utils/formatters"
import { ContractsList } from "./components/contracts-list"
import { ContractFormDialog } from "./components/contract-form-dialog"
import {
  SectionHeader,
  HuntlyCard,
  HuntlyCardHeader,
  HuntlyCardContent,
  HuntlyLoading,
  StatCard,
} from "@/components/huntly-ui"
import { FileText, CheckCircle2, DollarSign } from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  company?: string
}

interface Project {
  id: string
  name: string
  status: string
}

interface Payment {
  id: string
  installmentNumber: number
  amount: number
  dueDate: string
  paymentDate?: string
  status: string
}

interface ContractProject {
  id: string
  project: Project
}

interface Contract {
  id: string
  contractNumber: string
  title: string
  description?: string
  totalValue: number
  startDate?: string
  endDate?: string
  signedDate?: string
  status: string
  client: Client
  contractProjects: ContractProject[]
  payments: Payment[]
  terms?: string
  notes?: string
  createdAt: string
}

interface PaymentFormData {
  installmentNumber: number
  amount: string
  dueDate: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    contractNumber: "",
    description: "",
    totalValue: "",
    startDate: "",
    endDate: "",
    signedDate: "",
    status: "DRAFT",
    clientId: "",
    projectIds: [] as string[],
    terms: "",
    notes: "",
  })
  const [payments, setPayments] = useState<PaymentFormData[]>([])

  const fetchContracts = useCallback(async () => {
    try {
      const response = await fetch("/api/contratos")
      const data = await response.json()
      setContracts(data)
    } catch (error) {
      console.error("Error fetching contracts:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch("/api/clientes")
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }, [])

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projetos")
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }, [])

  useEffect(() => {
    fetchContracts()
    fetchClients()
    fetchProjects()
  }, [fetchContracts, fetchClients, fetchProjects])

  const resetForm = useCallback(() => {
    setEditingContract(null)
    setFormData({
      title: "",
      contractNumber: "",
      description: "",
      totalValue: "",
      startDate: "",
      endDate: "",
      signedDate: "",
      status: "DRAFT",
      clientId: "",
      projectIds: [],
      terms: "",
      notes: "",
    })
    setPayments([])
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingContract
        ? `/api/contratos/${editingContract.id}`
        : "/api/contratos"
      const method = editingContract ? "PUT" : "POST"

      const totalValueDecimal = (parseFloat(formData.totalValue) / 100).toFixed(2)

      const paymentsData = payments.map(p => ({
        installmentNumber: p.installmentNumber,
        amount: (parseFloat(p.amount) / 100).toFixed(2),
        dueDate: p.dueDate,
      }))

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalValue: totalValueDecimal,
          payments: paymentsData,
        }),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchContracts()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao salvar contrato")
      }
    } catch (error) {
      console.error("Error saving contract:", error)
      alert("Erro ao salvar contrato")
    }
  }, [editingContract, formData, payments, fetchContracts, resetForm])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contrato?")) return

    try {
      const response = await fetch(`/api/contratos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchContracts()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao excluir contrato")
      }
    } catch (error) {
      console.error("Error deleting contract:", error)
      alert("Erro ao excluir contrato")
    }
  }, [fetchContracts])

  const handleEdit = useCallback((contract: Contract) => {
    setEditingContract(contract)
    setFormData({
      title: contract.title,
      contractNumber: contract.contractNumber,
      description: contract.description || "",
      totalValue: prepareValueForCurrencyInput(contract.totalValue),
      startDate: contract.startDate ? contract.startDate.split("T")[0] : "",
      endDate: contract.endDate ? contract.endDate.split("T")[0] : "",
      signedDate: contract.signedDate ? contract.signedDate.split("T")[0] : "",
      status: contract.status,
      clientId: contract.client.id,
      projectIds: contract.contractProjects.map(cp => cp.project.id),
      terms: contract.terms || "",
      notes: contract.notes || "",
    })
    setPayments(
      contract.payments.map(p => ({
        installmentNumber: p.installmentNumber,
        amount: prepareValueForCurrencyInput(p.amount),
        dueDate: p.dueDate ? p.dueDate.split("T")[0] : "",
      }))
    )
    setIsDialogOpen(true)
  }, [])

  const handleFormChange = useCallback((field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const toggleProject = useCallback((projectId: string) => {
    setFormData(prev => ({
      ...prev,
      projectIds: prev.projectIds.includes(projectId)
        ? prev.projectIds.filter(id => id !== projectId)
        : [...prev.projectIds, projectId],
    }))
  }, [])

  const addPayment = useCallback(() => {
    setPayments(prev => [
      ...prev,
      {
        installmentNumber: prev.length + 1,
        amount: "",
        dueDate: "",
      },
    ])
  }, [])

  const removePayment = useCallback((index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updatePayment = useCallback((index: number, field: string, value: string | number) => {
    setPayments(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }, [])

  const handleDialogChange = useCallback((open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }, [resetForm])

  const activeContracts = useMemo(
    () => contracts.filter(c => c.status === "ACTIVE"),
    [contracts]
  )

  const totalValue = useMemo(
    () => activeContracts.reduce((sum, c) => sum + Number(c.totalValue), 0),
    [activeContracts]
  )

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)

  if (loading) {
    return <HuntlyLoading text="Carregando contratos..." />
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        label="Jurídico"
        title="Contratos"
        titleBold="& Pagamentos"
        action={
          <ContractFormDialog
            isOpen={isDialogOpen}
            onOpenChange={handleDialogChange}
            editingContract={editingContract}
            formData={formData}
            payments={payments}
            clients={clients}
            projects={projects}
            onFormChange={handleFormChange}
            onToggleProject={toggleProject}
            onAddPayment={addPayment}
            onRemovePayment={removePayment}
            onUpdatePayment={updatePayment}
            onSubmit={handleSubmit}
            onResetForm={resetForm}
          />
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total de Contratos"
          value={contracts.length}
          icon={FileText}
        />
        <StatCard
          label="Contratos Ativos"
          value={activeContracts.length}
          icon={CheckCircle2}
          className="[&_.font-display]:text-emerald-400"
        />
        <StatCard
          label="Valor Total Ativo"
          value={formatCurrency(totalValue)}
          icon={DollarSign}
          className="[&_.font-display]:text-blue-400"
        />
      </div>

      <HuntlyCard>
        <HuntlyCardHeader
          title="Lista de Contratos"
          description={`${contracts.length} contratos cadastrados`}
        />
        <HuntlyCardContent className="p-0">
          <ContractsList
            contracts={contracts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </HuntlyCardContent>
      </HuntlyCard>
    </div>
  )
}
