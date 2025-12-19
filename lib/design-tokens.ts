/**
 * Design Tokens - Huntly Admin Dashboard
 * Baseado na identidade visual do huntlyai.xyz
 *
 * Paleta: Dark-first, minimalista, alto contraste
 */

// =============================================================================
// STATUS COLORS
// =============================================================================

/**
 * Lead Status Colors
 * Classes Tailwind para badges de status de leads
 */
export const leadStatusColors: Record<string, string> = {
  NEW: "bg-zinc-800 text-zinc-300 border border-zinc-700",
  CONTACTED: "bg-blue-950 text-blue-300 border border-blue-800",
  QUALIFIED: "bg-emerald-950 text-emerald-300 border border-emerald-800",
  PROPOSAL_SENT: "bg-violet-950 text-violet-300 border border-violet-800",
  NEGOTIATION: "bg-amber-950 text-amber-300 border border-amber-800",
  WON: "bg-green-950 text-green-300 border border-green-800",
  LOST: "bg-red-950 text-red-300 border border-red-800",
}

export const leadStatusLabels: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Contactado",
  QUALIFIED: "Qualificado",
  PROPOSAL_SENT: "Proposta Enviada",
  NEGOTIATION: "Negociação",
  WON: "Ganho",
  LOST: "Perdido",
}

/**
 * Project Status Colors
 */
export const projectStatusColors: Record<string, string> = {
  PLANNING: "bg-zinc-800 text-zinc-300 border border-zinc-700",
  IN_PROGRESS: "bg-blue-950 text-blue-300 border border-blue-800",
  ON_HOLD: "bg-amber-950 text-amber-300 border border-amber-800",
  COMPLETED: "bg-green-950 text-green-300 border border-green-800",
  CANCELLED: "bg-red-950 text-red-300 border border-red-800",
}

export const projectStatusLabels: Record<string, string> = {
  PLANNING: "Planejamento",
  IN_PROGRESS: "Em Andamento",
  ON_HOLD: "Pausado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
}

/**
 * Meeting Status Colors
 */
export const meetingStatusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-950 text-blue-300 border border-blue-800",
  IN_PROGRESS: "bg-amber-950 text-amber-300 border border-amber-800",
  COMPLETED: "bg-green-950 text-green-300 border border-green-800",
  CANCELLED: "bg-red-950 text-red-300 border border-red-800",
}

export const meetingStatusLabels: Record<string, string> = {
  SCHEDULED: "Agendada",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
}

/**
 * Contract Status Colors
 */
export const contractStatusColors: Record<string, string> = {
  DRAFT: "bg-zinc-800 text-zinc-300 border border-zinc-700",
  ACTIVE: "bg-green-950 text-green-300 border border-green-800",
  COMPLETED: "bg-blue-950 text-blue-300 border border-blue-800",
  CANCELLED: "bg-red-950 text-red-300 border border-red-800",
  SUSPENDED: "bg-amber-950 text-amber-300 border border-amber-800",
}

export const contractStatusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  SUSPENDED: "Suspenso",
}

/**
 * Payment Status Colors
 */
export const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-amber-950 text-amber-300 border border-amber-800",
  PAID: "bg-green-950 text-green-300 border border-green-800",
  LATE: "bg-red-950 text-red-300 border border-red-800",
  CANCELLED: "bg-zinc-800 text-zinc-300 border border-zinc-700",
}

export const paymentStatusLabels: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  LATE: "Atrasado",
  CANCELLED: "Cancelado",
}

/**
 * Client Status Colors
 */
export const clientStatusColors: Record<string, string> = {
  ACTIVE: "bg-green-950 text-green-300 border border-green-800",
  INACTIVE: "bg-zinc-800 text-zinc-300 border border-zinc-700",
  CHURNED: "bg-red-950 text-red-300 border border-red-800",
}

export const clientStatusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  CHURNED: "Perdido",
}

/**
 * Member Status Colors
 */
export const memberStatusColors: Record<string, string> = {
  ACTIVE: "bg-green-950 text-green-300 border border-green-800",
  INACTIVE: "bg-zinc-800 text-zinc-300 border border-zinc-700",
  ON_LEAVE: "bg-amber-950 text-amber-300 border border-amber-800",
}

export const memberStatusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  ON_LEAVE: "De Licença",
}

/**
 * Member Role Labels
 */
export const memberRoleLabels: Record<string, string> = {
  DEVELOPER: "Desenvolvedor",
  DESIGNER: "Designer",
  PROJECT_MANAGER: "Gerente de Projeto",
  PRODUCT_MANAGER: "Gerente de Produto",
  QA_ENGINEER: "Engenheiro de QA",
  DEVOPS: "DevOps",
  DATA_SCIENTIST: "Cientista de Dados",
  BUSINESS_ANALYST: "Analista de Negócios",
  TECH_LEAD: "Tech Lead",
  TEAM_LEAD: "Team Lead",
  FOUNDER: "Fundador",
  CEO: "CEO",
  CTO: "CTO",
  CFO: "CFO",
  COO: "COO",
  INTERN: "Estagiário",
  JUNIOR: "Júnior",
  MID: "Pleno",
  SENIOR: "Sênior",
  STAFF: "Staff",
  PRINCIPAL: "Principal",
  OTHER: "Outro",
}

// =============================================================================
// TASK/STORY STATUS COLORS (Kanban)
// =============================================================================

/**
 * Task Status Colors
 */
export const taskStatusColors: Record<string, string> = {
  TODO: "bg-zinc-800 text-zinc-300 border border-zinc-700",
  IN_PROGRESS: "bg-blue-950 text-blue-300 border border-blue-800",
  IN_REVIEW: "bg-violet-950 text-violet-300 border border-violet-800",
  DONE: "bg-green-950 text-green-300 border border-green-800",
}

export const taskStatusLabels: Record<string, string> = {
  TODO: "A Fazer",
  IN_PROGRESS: "Em Progresso",
  IN_REVIEW: "Em Revisão",
  DONE: "Concluído",
}

/**
 * Kanban Column Styles
 */
export const kanbanColumnStyles: Record<string, { header: string; bg: string }> = {
  TODO: {
    header: "bg-zinc-900 text-zinc-300 border-t-2 border-zinc-600",
    bg: "bg-zinc-900/30",
  },
  IN_PROGRESS: {
    header: "bg-blue-950/50 text-blue-300 border-t-2 border-blue-500",
    bg: "bg-blue-950/20",
  },
  IN_REVIEW: {
    header: "bg-violet-950/50 text-violet-300 border-t-2 border-violet-500",
    bg: "bg-violet-950/20",
  },
  DONE: {
    header: "bg-green-950/50 text-green-300 border-t-2 border-green-500",
    bg: "bg-green-950/20",
  },
}

// =============================================================================
// PRIORITY COLORS
// =============================================================================

/**
 * Priority Colors (for icons and badges)
 */
export const priorityColors: Record<string, { text: string; bg: string; border: string }> = {
  URGENT: {
    text: "text-red-400",
    bg: "bg-red-950",
    border: "border-red-800",
  },
  HIGH: {
    text: "text-orange-400",
    bg: "bg-orange-950",
    border: "border-orange-800",
  },
  MEDIUM: {
    text: "text-amber-400",
    bg: "bg-amber-950",
    border: "border-amber-800",
  },
  LOW: {
    text: "text-blue-400",
    bg: "bg-blue-950",
    border: "border-blue-800",
  },
}

export const priorityLabels: Record<string, string> = {
  URGENT: "Urgente",
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
}

// =============================================================================
// TRANSACTION COLORS
// =============================================================================

export const transactionTypeColors: Record<string, string> = {
  INCOME: "bg-green-950 text-green-300 border border-green-800",
  EXPENSE: "bg-red-950 text-red-300 border border-red-800",
}

export const transactionTypeLabels: Record<string, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
}

// =============================================================================
// CHART COLORS
// =============================================================================

/**
 * Chart Colors - Paleta otimizada para dark mode
 */
export const chartColors = {
  // Primary colors for most charts
  primary: "#3b82f6",   // blue-500
  secondary: "#10b981", // emerald-500
  tertiary: "#8b5cf6",  // violet-500
  quaternary: "#f59e0b", // amber-500

  // Semantic colors
  income: "#10b981",    // emerald-500
  expense: "#ef4444",   // red-500

  // Extended palette for pie charts
  palette: [
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#8b5cf6", // violet-500
    "#f59e0b", // amber-500
    "#ec4899", // pink-500
    "#06b6d4", // cyan-500
  ],

  // Grid and axis colors
  grid: "rgba(255, 255, 255, 0.1)",
  axis: "rgba(255, 255, 255, 0.5)",
  tooltip: {
    bg: "#18181b",       // zinc-900
    border: "#3f3f46",   // zinc-700
    text: "#fafafa",     // zinc-50
  },
}

// =============================================================================
// AVATAR COLORS
// =============================================================================

/**
 * Avatar Background Colors - Para fallback quando não há imagem
 */
export const avatarColors = [
  "bg-zinc-700 text-zinc-200",
  "bg-blue-900 text-blue-200",
  "bg-emerald-900 text-emerald-200",
  "bg-violet-900 text-violet-200",
  "bg-amber-900 text-amber-200",
  "bg-rose-900 text-rose-200",
]

/**
 * Get avatar color by index or name hash
 */
export function getAvatarColor(identifier: string | number): string {
  if (typeof identifier === "number") {
    return avatarColors[identifier % avatarColors.length]
  }
  // Hash the string to get a consistent color
  let hash = 0
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

// =============================================================================
// LEAD SOURCE COLORS
// =============================================================================

export const leadSourceColors: Record<string, string> = {
  WEBSITE: "bg-blue-950 text-blue-300 border border-blue-800",
  REFERRAL: "bg-green-950 text-green-300 border border-green-800",
  SOCIAL_MEDIA: "bg-violet-950 text-violet-300 border border-violet-800",
  ZEROS_A_DIREITA: "bg-amber-950 text-amber-300 border border-amber-800",
  EVENT: "bg-rose-950 text-rose-300 border border-rose-800",
  OTHER: "bg-zinc-800 text-zinc-300 border border-zinc-700",
}

export const leadSourceLabels: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Indicação",
  SOCIAL_MEDIA: "Redes Sociais",
  ZEROS_A_DIREITA: "Zeros à Direita",
  EVENT: "Evento",
  OTHER: "Outro",
}

// =============================================================================
// ICON COLORS
// =============================================================================

/**
 * Icon Colors para stats cards e indicadores
 */
export const iconColors = {
  default: "text-zinc-400",
  primary: "text-blue-400",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
  info: "text-violet-400",
}

// =============================================================================
// BILLING TYPE COLORS
// =============================================================================

export const billingTypeColors: Record<string, string> = {
  FIXED_PRICE: "bg-indigo-950 text-indigo-300 border border-indigo-800",
  HOURLY_RATE: "bg-amber-950 text-amber-300 border border-amber-800",
}

export const billingTypeLabels: Record<string, string> = {
  FIXED_PRICE: "Valor Fixo",
  HOURLY_RATE: "Por Hora",
}

// =============================================================================
// ALERT COLORS
// =============================================================================

export const alertStyles = {
  success: "bg-green-950/50 border border-green-800 text-green-300",
  error: "bg-red-950/50 border border-red-800 text-red-300",
  warning: "bg-amber-950/50 border border-amber-800 text-amber-300",
  info: "bg-blue-950/50 border border-blue-800 text-blue-300",
}
