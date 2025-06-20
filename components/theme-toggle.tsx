"use client"
import { Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  // Always set dark mode on click (or just show dark icon)
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme('dark')}>
      <Moon className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Dark mode only</span>
    </Button>
  )
}
