import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAccounts } from '../../hooks/useAccounts'
import * as accountsApi from '../../api/accounts'
import type { Account } from '../../types'

const account = (id: string, name: string): Account => ({
  Id: id,
  Name: name,
  Industry: null,
  Phone: null,
  Website: null,
  BillingCity: null,
  BillingCountry: null,
})

describe('useAccounts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('loads page 1 on mount', async () => {
    const spy = vi.spyOn(accountsApi, 'fetchAccounts').mockResolvedValue({
      records: [account('1', 'Acme')],
      page: 1,
      pageSize: 10,
      totalSize: 1,
      totalPages: 1,
    })

    const { result } = renderHook(() => useAccounts())

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(spy).toHaveBeenCalledWith(1, 10)
    expect(result.current.accounts).toHaveLength(1)
    expect(result.current.totalSize).toBe(1)
  })

  it('refetches when the page changes', async () => {
    const spy = vi.spyOn(accountsApi, 'fetchAccounts').mockResolvedValue({
      records: [],
      page: 1,
      pageSize: 10,
      totalSize: 30,
      totalPages: 3,
    })

    const { result } = renderHook(() => useAccounts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setPage(2))
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith(2, 10))
  })

  it('resets to page 1 when the page size changes', async () => {
    vi.spyOn(accountsApi, 'fetchAccounts').mockResolvedValue({
      records: [],
      page: 1,
      pageSize: 10,
      totalSize: 0,
      totalPages: 1,
    })

    const { result } = renderHook(() => useAccounts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.setPage(3))
    await waitFor(() => expect(result.current.page).toBe(3))

    act(() => result.current.changePageSize(50))
    expect(result.current.page).toBe(1)
    expect(result.current.pageSize).toBe(50)
  })

  it('surfaces a load error', async () => {
    vi.spyOn(accountsApi, 'fetchAccounts').mockRejectedValue(
      new Error('network down')
    )

    const { result } = renderHook(() => useAccounts())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('network down')
  })
})
