"use client"

import { ReactNode, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { EmailSidebar } from "@/components/email/email-sidebar"
import { EmailComposeSheet } from "@/components/email/email-compose-sheet"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

export default function EmailLayout({ children }: { children: ReactNode }) {
  const [composeOpen, setComposeOpen] = useState(false)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Mail Center"
          description="Surat elektronik terpusat RRI"
        />
        <Button
          onClick={() => setComposeOpen(true)}
          className="bg-gradient-to-b from-[#0000FF] to-[#0000D9] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.1)] hover:opacity-95"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </div>

      <div className="flex gap-6">
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-card border border-border rounded-xl p-2 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <EmailSidebar />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-card border border-border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            {children}
          </div>
        </main>
      </div>

      <EmailComposeSheet
        open={composeOpen}
        onOpenChange={setComposeOpen}
      />
    </div>
  )
}
