const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001'
const API_BASE = `${API_URL.replace(/\/+$/, '')}/api/bankdata`

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = localStorage.getItem('accessToken')
  const res = await fetch(`${API_BASE}${path}`, {
    ...(init || {}),
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: 'include',
  })
  if (!res.ok) {
    const status = res.status
    let text: string | undefined
    let parsed: any
    try {
      text = await res.text()
      try { parsed = text ? JSON.parse(text) : undefined } catch { /* not json */ }
      // Friendly handling for rate limit (429) – use backend provided message only
      if (status === 429 && parsed?.message) {
        const retry = parsed.retryAfterSeconds
        if (retry) {
          try { localStorage.setItem('bank_sync_limit_until', String(Date.now() + retry * 1000)) } catch {}
        }
        const suffix = retry ? ` (${Math.ceil(retry / 3600)}h)` : ''
        throw new Error(parsed.message + suffix)
      }
      // Generic: prefer parsed.message if exists, else compact technical
      if (parsed?.message) throw new Error(parsed.message)
      throw new Error(`bankdata ${status}: ${text}`)
    } catch (err) {
      if (err instanceof Error) throw err
      throw new Error(`bankdata ${status}: ${text || 'error'}`)
    }
  }
  return res.json() as Promise<T>
}

export const bankdataAPI = {
  institutions: async (country?: string): Promise<{ institutions: Array<{ id: string; name: string; logo?: string }> }> => {
    const qs = country ? `?country=${encodeURIComponent(country)}` : ''
    return req(`/institutions${qs}`)
  },

  start: async (params?: {
    country?: string
    institutionId?: string
    useAgreement?: boolean
    max_historical_days?: number
    access_valid_for_days?: number
    access_scope?: Array<'balances' | 'details' | 'transactions'>
    user_language?: string
    reference?: string
  }): Promise<{ link: string; requisitionId: string; institutionId: string }> => {
    return req('/start', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    })
  },

  accounts: async (): Promise<{ accounts: string[] }> => {
    return req('/accounts')
  },

  transactions: async (accountId: string, range?: { date_from?: string; date_to?: string }): Promise<any> => {
    const qs = new URLSearchParams()
    if (range?.date_from) qs.set('date_from', range.date_from)
    if (range?.date_to) qs.set('date_to', range.date_to)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    return req(`/transactions?accountId=${encodeURIComponent(accountId)}${suffix}`)
  },

  import: async (accountId: string, range?: { date_from?: string; date_to?: string; incremental?: boolean }): Promise<{ message: string; imported: number; duplicatesCount: number; usedRange?: { date_from?: string; date_to?: string }; incremental?: boolean }> => {
    return req('/import', {
      method: 'POST',
      body: JSON.stringify({ accountId, ...range }),
    })
  },
  importAsync: async (accountId: string, range?: { date_from?: string; date_to?: string; incremental?: boolean }): Promise<{ message: string; jobId: string; total: number; phase: string; usedRange?: { date_from?: string; date_to?: string }; incremental?: boolean; async: true }> => {
    return req('/import', {
      method: 'POST',
      body: JSON.stringify({ accountId, ...(range || {}), mode: 'async' }),
    })
  },
  importProgress: async (jobId: string): Promise<{ jobId: string; total: number; processed: number; imported: number; duplicatesCount: number; phase: string; startedAt: number; updatedAt: number; done: boolean; error?: string | null; etaMs?: number | null }> => {
    return req(`/import/progress/${encodeURIComponent(jobId)}`)
  },
  autoSync: async (minAgeMinutes?: number): Promise<{ started: Array<{ accountId: string; jobId: string; total: number }>; count: number }> => {
    return req('/auto/sync', {
      method: 'POST',
      body: JSON.stringify(minAgeMinutes ? { minAgeMinutes } : {}),
    })
  },
  importDebug: async (): Promise<{ message: string; imported: number; duplicatesCount: number }> => {
    return req('/import/debug', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }
}
