import { useCallback, useEffect, useState } from 'react'
import { fetchAccounts } from '../api/accounts'
import type { Account } from '../types'

export function useAccounts(initialPageSize = 10) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [totalSize, setTotalSize] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAccounts(page, pageSize)
      setAccounts(data.records)
      setTotalSize(data.totalSize)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

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

  const goToFirstPage = useCallback(() => setPage(1), [])

  return {
    accounts,
    page,
    pageSize,
    totalSize,
    totalPages,
    loading,
    error,
    setPage,
    changePageSize,
    goToFirstPage,
    reload,
  }
}
