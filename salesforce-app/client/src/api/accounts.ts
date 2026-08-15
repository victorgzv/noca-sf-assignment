import type { AccountsResponse, NewAccountInput } from '../types'

interface ApiErrorPayload {
  error?: string
  errors?: { message: string }[]
}

function extractErrorMessage(payload: ApiErrorPayload, fallback: string): string {
  if (payload.errors) {
    return payload.errors.map((e) => e.message).join(', ')
  }
  return payload.error || fallback
}

export async function fetchAccounts(page: number, pageSize: number): Promise<AccountsResponse> {
  const res = await fetch(`/accounts?page=${page}&pageSize=${pageSize}`)
  const data = await res.json()
  if (!res.ok) {
    throw new Error(extractErrorMessage(data, 'Failed to load accounts'))
  }
  return data as AccountsResponse
}

export async function createAccount(input: NewAccountInput): Promise<{ id: string }> {
  const res = await fetch('/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(extractErrorMessage(data, 'Failed to create account'))
  }
  return data as { id: string }
}
