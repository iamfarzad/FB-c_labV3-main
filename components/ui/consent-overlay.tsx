'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'

interface ConsentOverlayProps {
  isVisible: boolean
  onClose: () => void
  onSubmit: (data: { email: string; companyUrl: string }) => void
  isLoading?: boolean
}

export function ConsentOverlay({ isVisible, onClose, onSubmit, isLoading = false }: ConsentOverlayProps) {
  const [email, setEmail] = React.useState('')
  const [companyUrl, setCompanyUrl] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim() && companyUrl.trim()) {
      onSubmit({ email: email.trim(), companyUrl: companyUrl.trim() })
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="consent-overlay">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Help us personalize your experience</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Share your contact details to get a personalized AI consultation experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Website</Label>
              <Input
                id="company"
                type="url"
                placeholder="https://yourcompany.com"
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                required
                data-testid="company-input"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !email.trim() || !companyUrl.trim()}
                className="flex-1"
                data-testid="consent-allow"
              >
                {isLoading ? 'Processing...' : 'Continue'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
