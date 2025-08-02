import type React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Container } from "@/components/ui/container"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="w-full py-6">
        <Container>
          {children}
        </Container>
      </main>
    </div>
  )
}
