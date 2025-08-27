import { NextResponse } from 'next/server'
import { z } from 'zod'

const ConsentInput = z.object({
  email: z.string().email(),
  companyUrl: z.string().url().optional().or(z.literal('')).optional(),
  policyVersion: z.string().min(1)
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = ConsentInput.parse(body)

    const payload = {
      email: data.email,
      companyUrl: data.companyUrl || null,
      policyVersion: data.policyVersion,
      ts: Date.now()
    }

    const res = NextResponse.json({ ok: true })

    // Set consent cookie (HTTP-only for privacy)
    res.headers.append(
      'Set-Cookie',
      `fbc-consent=${encodeURIComponent(JSON.stringify(payload))}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
    )

    return res
  } catch (error: unknown) {
    const isZod = (error as any)?.name === 'ZodError'
    return NextResponse.json(
      { ok: false, error: isZod ? 'Invalid input' : 'Internal server error' },
      { status: isZod ? 400 : 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { NextRequest, NextResponse } from 'next/server'

type ConsentCookie = {
  allow: boolean
  allowedDomains: string[]
  ts: number
  policyVersion?: string
  name?: string
  email?: string
  companyDomain?: string | undefined
}

function inferDomainFromEmail(email?: string): string | null {
  if (!email || !email.includes('@')) return null
  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) return null
  const generic = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','proton.me','protonmail.com']
  if (generic.includes(domain)) return null
  return domain
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('fbc-consent')?.value
  if (!cookie) return NextResponse.json({ allow: false }, { status: 200 })
  try {
    const data = JSON.parse(cookie) as ConsentCookie
    return NextResponse.json({ allow: !!data.allow, allowedDomains: data.allowedDomains, ts: data.ts })
  } catch {
    return NextResponse.json({ allow: false }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, companyUrl, policyVersion, name } = await req.json()
    let domain: string | null = null
    const inferred = inferDomainFromEmail(email)
    if (inferred) domain = inferred
    else if (typeof companyUrl === 'string' && companyUrl.length > 3) {
      try { domain = new URL(companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`).hostname } catch {}
    }
    const allowedDomains = Array.from(new Set([domain].filter(Boolean) as string[]).values())
    // Always allow linkedin.com as secondary source if a domain exists
    if (allowedDomains.length) allowedDomains.push('linkedin.com')

    const value: ConsentCookie = { allow: true, allowedDomains, ts: Date.now(), policyVersion, name, email, companyDomain: domain || undefined }
    const res = NextResponse.json({ ok: true, allowedDomains })
    const isProd = process.env.NODE_ENV === 'production';
    res.cookies.set('fbc-consent', JSON.stringify(value), { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 60 * 60 * 24 * 30 })
    return res
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('fbc-consent', '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 })
  return res
}


