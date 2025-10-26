/**
 * Utility functions for formatting values
 */

/**
 * Formats a phone number to Brazilian format with country code
 * Example: +55 (11) 98765-4321
 */
export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "")
  
  if (numbers.length === 0) return ""
  if (numbers.length <= 2) return `+${numbers}`
  if (numbers.length <= 4) return `+${numbers.slice(0, 2)} (${numbers.slice(2)}`
  if (numbers.length <= 9) return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4)}`
  
  return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`
}

/**
 * Removes all non-numeric characters from a phone number
 */
export function unformatPhone(value: string): string {
  return value.replace(/\D/g, "")
}

/**
 * Formats a number to Brazilian currency format as user types
 * Example: typing "12345" -> "R$ 123,45"
 */
export function formatCurrencyInput(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, "")
  
  if (numbers === "") return ""
  
  // Converte para número e divide por 100 para ter os centavos
  const amount = parseFloat(numbers) / 100
  
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}

/**
 * Formats a stored number value to display currency
 * Example: 1234.56 -> "R$ 1.234,56"
 */
export function formatCurrency(value: string | number): string {
  if (!value || value === "") return "R$ 0,00"
  
  const numericValue = typeof value === "number" ? value : parseFloat(value)
  
  if (isNaN(numericValue)) return "R$ 0,00"
  
  return numericValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}

/**
 * Removes currency formatting and returns the numeric value as string
 * Used when saving to database (returns decimal format)
 */
export function unformatCurrency(value: string): string {
  const numbers = value.replace(/\D/g, "")
  if (numbers === "") return ""
  // Divide por 100 para converter centavos em decimal
  return (parseFloat(numbers) / 100).toString()
}

/**
 * Converts a decimal value from database to the format expected by formatCurrencyInput
 * Example: 1234.56 -> "123456" (to be displayed as R$ 1.234,56)
 */
export function prepareValueForCurrencyInput(value: number | string | undefined): string {
  if (!value || value === "") return ""
  
  const numericValue = typeof value === "number" ? value : parseFloat(value)
  
  if (isNaN(numericValue)) return ""
  
  // Multiplica por 100 e remove decimais para obter os centavos
  const cents = Math.round(numericValue * 100)
  return cents.toString()
}

/**
 * Formats a CNPJ (Brazilian company registration number)
 * Example: 12.345.678/0001-90
 */
export function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, "")
  
  if (numbers.length === 0) return ""
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
  
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`
}

/**
 * Removes all non-numeric characters from a CNPJ
 */
export function unformatCNPJ(value: string): string {
  return value.replace(/\D/g, "")
}

/**
 * Formats a CPF (Brazilian personal ID number)
 * Example: 123.456.789-01
 */
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "")
  
  if (numbers.length === 0) return ""
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
  
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
}

/**
 * Removes all non-numeric characters from a CPF
 */
export function unformatCPF(value: string): string {
  return value.replace(/\D/g, "")
}

/**
 * Formats a CEP (Brazilian postal code)
 * Example: 12345-678
 */
export function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, "")
  
  if (numbers.length === 0) return ""
  if (numbers.length <= 5) return numbers
  
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
}

/**
 * Removes all non-numeric characters from a CEP
 */
export function unformatCEP(value: string): string {
  return value.replace(/\D/g, "")
}

