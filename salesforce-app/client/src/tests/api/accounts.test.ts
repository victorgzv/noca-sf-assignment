import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchAccounts, createAccount } from '../../api/accounts'

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body,
  } as Response
}

describe('fetchAccounts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('requests the given page and pageSize', async () => {
    const payload = {
      records: [],
      page: 2,
      pageSize: 25,
      totalSize: 0,
      totalPages: 1,
    }
    vi.mocked(fetch).mockResolvedValue(jsonResponse(payload))

    const result = await fetchAccounts(2, 25)

    expect(fetch).toHaveBeenCalledWith('/accounts?page=2&pageSize=25')
    expect(result).toEqual(payload)
  })

  it('throws the server error message on failure', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ error: 'authentication failure' }, false)
    )

    await expect(fetchAccounts(1, 10)).rejects.toThrow('authentication failure')
  })

  it('URL-encodes and includes the search term when given', async () => {
    const payload = { records: [], page: 1, pageSize: 10, totalSize: 0, totalPages: 1 }
    vi.mocked(fetch).mockResolvedValue(jsonResponse(payload))

    await fetchAccounts(1, 10, 'Acme & Co')

    expect(fetch).toHaveBeenCalledWith('/accounts?page=1&pageSize=10&search=Acme+%26+Co')
  })

  it('omits the search param when the search term is empty', async () => {
    const payload = { records: [], page: 1, pageSize: 10, totalSize: 0, totalPages: 1 }
    vi.mocked(fetch).mockResolvedValue(jsonResponse(payload))

    await fetchAccounts(1, 10, '')

    expect(fetch).toHaveBeenCalledWith('/accounts?page=1&pageSize=10')
  })
})

describe('createAccount', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('POSTs the account payload as JSON', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ id: '001xyz' }))

    const result = await createAccount({ Name: 'Acme' })

    expect(fetch).toHaveBeenCalledWith('/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Name: 'Acme' }),
    })
    expect(result).toEqual({ id: '001xyz' })
  })

  it('joins Salesforce validation errors into one message', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(
        { errors: [{ message: 'Required field missing: Name' }] },
        false
      )
    )

    await expect(createAccount({ Name: '' })).rejects.toThrow(
      'Required field missing: Name'
    )
  })
})
