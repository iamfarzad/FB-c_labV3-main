"use client"

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { BrainCircuit } from 'lucide-react'

interface ContextDisplayProps {
  context: any
}

const ContextValue = ({ value }: { value: any }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-xs text-muted-foreground italic">empty</span>
  }
  if (typeof value === 'object') {
    return (
      <pre className="text-xs bg-muted p-2 rounded-md mt-1 overflow-x-auto">
        {JSON.stringify(value, null, 2)}
      </pre>
    )
  }
  return <Badge variant="secondary">{String(value)}</Badge>
}

export function ContextDisplay({ context }: ContextDisplayProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          className="ml-2 text-[11px] bg-accent/10 text-accent border-accent/20 cursor-pointer hover:bg-accent/20 transition-colors"
        >
          <BrainCircuit className="w-3 h-3 mr-1" />
          Context Aware
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Conversational Context</h4>
            <p className="text-sm text-muted-foreground">
              The AI is aware of the following information.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            {Object.entries(context || {}).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 items-start gap-4">
                <span className="font-semibold capitalize col-span-1">{key.replace(/_/g, ' ')}</span>
                <div className="col-span-2">
                  <ContextValue value={value} />
                </div>
              </div>
            ))}
            {(!context || Object.keys(context).length === 0) && (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                No context available yet.
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
