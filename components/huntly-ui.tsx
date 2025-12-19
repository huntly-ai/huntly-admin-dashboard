"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// =============================================================================
// HUNTLY CARD
// Base card component with corner accents and hover effects
// =============================================================================

interface HuntlyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
}

export function HuntlyCard({ children, className, hover = true, ...props }: HuntlyCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-card backdrop-blur-sm border border-border transition-all duration-300",
        hover && "hover:border-muted-foreground/30",
        className
      )}
      {...props}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-transparent group-hover:border-foreground/30 transition-colors duration-300" />
      <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-transparent group-hover:border-foreground/30 transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-transparent group-hover:border-foreground/30 transition-colors duration-300" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-transparent group-hover:border-foreground/30 transition-colors duration-300" />
      {children}
      {/* Hover line */}
      <div className="absolute bottom-0 left-0 w-0 h-px bg-foreground/30 group-hover:w-full transition-all duration-500" />
    </div>
  )
}

// =============================================================================
// HUNTLY CARD HEADER
// Header section for cards with title and description
// =============================================================================

interface HuntlyCardHeaderProps {
  title: React.ReactNode
  description?: string
  action?: React.ReactNode
}

export function HuntlyCardHeader({ title, description, action }: HuntlyCardHeaderProps) {
  return (
    <div className="flex items-center justify-between p-5 border-b border-border/50">
      <div>
        <h3 className="font-display text-base font-medium text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

// =============================================================================
// HUNTLY CARD CONTENT
// Content wrapper for cards
// =============================================================================

interface HuntlyCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function HuntlyCardContent({ children, className, ...props }: HuntlyCardContentProps) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  )
}

// =============================================================================
// SECTION HEADER
// Huntly-style section header with label, title and decorative elements
// =============================================================================

interface SectionHeaderProps {
  label: string
  title: string
  titleBold?: string
  action?: React.ReactNode
}

export function SectionHeader({ label, title, titleBold, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-8 h-px bg-foreground/20" />
          <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            {label}
          </span>
        </div>
        <h2 className="font-display text-2xl font-light text-foreground">
          <span className="font-medium animate-blink">_</span> {title}{" "}
          {titleBold && <span className="font-medium">{titleBold}</span>}
        </h2>
      </div>
      {action}
    </div>
  )
}

// =============================================================================
// STAT CARD
// Card for displaying statistics with icon and optional trend
// =============================================================================

interface StatCardProps {
  label: string
  value: string | number
  description?: string
  icon?: React.ElementType
  trend?: {
    positive: boolean
    label: string
  }
  className?: string
}

export function StatCard({ label, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <HuntlyCard className={cn("p-5", className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
        )}
      </div>

      <div className="font-display text-2xl font-medium text-foreground mb-1">
        {value}
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {trend && (
        <div className="flex items-center text-xs mt-2">
          <span className={trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
            {trend.label}
          </span>
        </div>
      )}
    </HuntlyCard>
  )
}

// =============================================================================
// HUNTLY BUTTON
// Styled button matching the website design
// =============================================================================

interface HuntlyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

export function HuntlyButton({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: HuntlyButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-transparent border border-border text-foreground hover:border-muted-foreground hover:bg-muted/50",
    ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
  }

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// =============================================================================
// HUNTLY INPUT
// Styled input matching the website design
// =============================================================================

interface HuntlyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const HuntlyInput = React.forwardRef<HTMLInputElement, HuntlyInputProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground block">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-11 px-4 bg-background border border-input focus:border-ring text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
HuntlyInput.displayName = "HuntlyInput"

// =============================================================================
// HUNTLY LABEL
// Styled label matching the website design
// =============================================================================

interface HuntlyLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export function HuntlyLabel({ children, className, ...props }: HuntlyLabelProps) {
  return (
    <label
      className={cn("text-xs tracking-[0.2em] uppercase text-muted-foreground block", className)}
      {...props}
    >
      {children}
    </label>
  )
}

// =============================================================================
// HUNTLY BADGE
// Styled badge/tag component
// =============================================================================

interface HuntlyBadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "info"
  className?: string
}

export function HuntlyBadge({ children, variant = "default", className }: HuntlyBadgeProps) {
  const variants = {
    default: "bg-muted text-muted-foreground border-border",
    success: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    warning: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    danger: "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
    info: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 text-[10px] tracking-wide uppercase border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// =============================================================================
// HUNTLY DIVIDER
// Decorative divider line
// =============================================================================

interface HuntlyDividerProps {
  className?: string
}

export function HuntlyDivider({ className }: HuntlyDividerProps) {
  return (
    <div className={cn("flex items-center gap-4 my-6", className)}>
      <div className="flex-1 h-px bg-border" />
      <span className="text-muted-foreground/50 text-xs">{"///"}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

// =============================================================================
// HUNTLY LOADING
// Loading spinner with corner accents
// =============================================================================

interface HuntlyLoadingProps {
  text?: string
}

export function HuntlyLoading({ text = "Carregando..." }: HuntlyLoadingProps) {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 border border-border animate-pulse" />
          <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-foreground/30" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-foreground/30" />
        </div>
        <p className="text-muted-foreground text-sm tracking-wide">{text}</p>
      </div>
    </div>
  )
}

// =============================================================================
// HUNTLY EMPTY STATE
// Empty state placeholder
// =============================================================================

interface HuntlyEmptyProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
}

export function HuntlyEmpty({ icon: Icon, title, description, action }: HuntlyEmptyProps) {
  return (
    <div className="text-center py-12">
      {Icon && (
        <Icon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
      )}
      <h3 className="font-display text-lg font-medium text-muted-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground/70 mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
