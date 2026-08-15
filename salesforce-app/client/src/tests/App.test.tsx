import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import * as accountsApi from '../api/accounts'
import type { Account } from '../types'

const account = (id: string, name: string): Account => ({
  Id: id,
  Name: name,
  Industry: null,
  Phone: null,
  Website: null,
  BillingCity: null,
  BillingCountry: null,
})

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('loads and displays accounts on mount', async () => {
    vi.spyOn(accountsApi, 'fetchAccounts').mockResolvedValue({
      records: [account('1', 'Acme Corp')],
      page: 1,
      pageSize: 10,
      totalSize: 1,
      totalPages: 1,
    })

    render(<App />)

    expect(await screen.findByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Showing 1–1 of 1')).toBeInTheDocument()
  })

  it('shows an error banner when loading fails', async () => {
    vi.spyOn(accountsApi, 'fetchAccounts').mockRejectedValue(
      new Error('authentication failure')
    )

    render(<App />)

    expect(await screen.findByText('authentication failure')).toBeInTheDocument()
  })

  it('creates a new account and refreshes the list', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(accountsApi, 'fetchAccounts').mockResolvedValue({
      records: [account('1', 'Acme Corp')],
      page: 1,
      pageSize: 10,
      totalSize: 1,
      totalPages: 1,
    })
    vi.spyOn(accountsApi, 'createAccount').mockResolvedValue({ id: '002' })

    render(<App />)
    await screen.findByText('Acme Corp')
    fetchSpy.mockClear()

    await user.click(screen.getByRole('button', { name: 'New Account' }))
    await user.type(screen.getByLabelText('Name *'), 'New Co')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(fetchSpy).toHaveBeenCalledWith(1, 10)
  })
})
