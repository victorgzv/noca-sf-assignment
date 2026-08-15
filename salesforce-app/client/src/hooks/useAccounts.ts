import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchAccounts } from '../api/accounts'
import type { Account } from '../types'
import { useDebouncedValue } from './useDebouncedValue'

export function useAccounts(initialPageSize = 10) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [searchInput, setSearchInput] = useState('')
  const [totalSize, setTotalSize] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const latestRequestId = useRef(0)

  const debouncedSearch = useDebouncedValue(searchInput, 300)

  const reload = useCallback(async () => {
    const requestId = ++latestRequestId.current
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAccounts(page, pageSize, debouncedSearch.trim())
      if (requestId !== latestRequestId.current) return
      setAccounts(data.records)
      setTotalSize(data.totalSize)
      setTotalPages(data.totalPages)
    } catch (err) {
      if (requestId !== latestRequestId.current) return
      setError(err instanceof Error ? err.message : 'Failed to load accounts')
    } finally {
      if (requestId === latestRequestId.current) setLoading(false)
    }
  }, [page, pageSize, debouncedSearch])

  useEffect(() => {
    // Intentional fetch-on-mount/dependency-change; setLoading(true) runs
    // synchronously so the UI shows a spinner before the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload()
  }, [reload])

  const changePageSize = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  const changeSearch = useCallback((value: string) => {
    setSearchInput(value)
    setPage(1)
  }, [])

  const goToFirstPage = useCallback(() => setPage(1), [])

  return {
    accounts,
    page,
    pageSize,
    search: searchInput,
    totalSize,
    totalPages,
    loading,
    error,
    setPage,
    changePageSize,
    setSearch: changeSearch,
    goToFirstPage,
    reload,
  }
}
