"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const redirect = searchParams.get("redirect") || "/"
          router.push(redirect)
        }
      } catch {
        // Not logged in
      }
    }
    checkAuth()
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao fazer login")
        return
      }

      const redirect = searchParams.get("redirect") || "/"
      router.push(redirect)
      router.refresh()
    } catch {
      setError("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 grid-bg corner-accent">
      {/* Decorative lines */}
      <div className="fixed top-1/4 left-8 w-px h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />
      <div className="fixed bottom-1/4 right-8 w-px h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />
      <div className="fixed top-1/3 right-16 w-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />
      <div className="fixed bottom-1/3 left-16 w-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />

      {/* Login Card */}
      <div className="relative w-full max-w-md group">
        {/* Card with huntly style */}
        <div className="relative bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 hover:border-zinc-700 transition-all duration-300 p-8">
          {/* Corner accents on card */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-white/0 group-hover:border-white/30 transition-colors duration-300" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-white/0 group-hover:border-white/30 transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-white/0 group-hover:border-white/30 transition-colors duration-300" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-white/0 group-hover:border-white/30 transition-colors duration-300" />

          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border border-zinc-700" />
                <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/20" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-white/20" />
                <span className="font-display text-2xl font-medium text-white">H</span>
              </div>
            </div>

            {/* Title with decorative lines */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-white/30" />
              <span className="text-white/50 text-xs tracking-widest">{"///"}</span>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-white/30" />
            </div>

            <h1 className="font-display text-2xl font-light text-white mb-1">
              <span className="font-medium animate-blink">_</span> Huntly <span className="font-medium">Dashboard</span>
            </h1>

            <p className="text-zinc-500 text-sm tracking-wide">
              Entre com suas credenciais
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-950/50 border border-red-900/50 text-red-400 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs tracking-[0.2em] uppercase text-zinc-500">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-black/50 border-zinc-800 focus:border-zinc-600 text-white placeholder:text-zinc-600 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs tracking-[0.2em] uppercase text-zinc-500">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-black/50 border-zinc-800 focus:border-zinc-600 text-white placeholder:text-zinc-600 h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-zinc-500 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked as boolean)}
                disabled={loading}
                className="border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:border-white"
              />
              <Label
                htmlFor="remember"
                className="text-sm text-zinc-400 cursor-pointer hover:text-white transition-colors"
              >
                Manter conectado por 30 dias
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-medium tracking-wide transition-all duration-300"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Hover line effect */}
          <div className="absolute bottom-0 left-0 w-0 h-px bg-white/30 group-hover:w-full transition-all duration-500" />
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <p className="text-zinc-600 text-xs tracking-wider">
          &copy; {new Date().getFullYear()} Huntly
        </p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 grid-bg corner-accent">
      <div className="relative w-full max-w-md">
        <div className="relative bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 p-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border border-zinc-700" />
                <span className="font-display text-2xl font-medium text-white animate-pulse">H</span>
              </div>
            </div>
            <p className="text-zinc-500 text-sm tracking-wide">Carregando...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginForm />
    </Suspense>
  )
}
