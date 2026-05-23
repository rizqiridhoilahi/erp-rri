"use client"

import { Check } from "lucide-react"

interface Step {
  key: string
  label: string
}

interface StatusWorkflowProps {
  steps: Step[]
  current: string
}

export function StatusWorkflow({ steps, current }: StatusWorkflowProps) {
  const currentIdx = steps.findIndex((s) => s.key === current)

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const isCompleted = i <= currentIdx
        const isCurrent = i === currentIdx

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                } ${isCurrent ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""}`}
              >
                {isCompleted && i < currentIdx ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-sm whitespace-nowrap ${
                  isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-3 h-px w-12 transition-colors ${
                  i < currentIdx ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
