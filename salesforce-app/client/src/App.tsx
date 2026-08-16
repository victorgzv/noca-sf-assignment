import { useState } from 'react'
import { useAccounts } from './hooks/useAccounts'
import { AccountsTable } from './components/AccountsTable'
import { Pagination } from './components/Pagination'
import { NewAccountModal } from './components/NewAccountModal'
import { ErrorBanner } from './components/ErrorBanner'
import { ThemeToggle } from './components/ThemeToggle'
import './App.css'

function App() {
  const {
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
  } = useAccounts()
  const [showForm, setShowForm] = useState(false)

  async function handleCreated() {
    setShowForm(false)
    if (page === 1) {
      await reload()
    } else {
      goToFirstPage()
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Accounts</h1>
        <div className="page-header-actions">
          <ThemeToggle />
          <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
            New Account
          </button>
        </div>
      </header>

      {error && <ErrorBanner message={error} />}

      <AccountsTable accounts={accounts} loading={loading} />

      <Pagination
        page={page}
        pageSize={pageSize}
        totalSize={totalSize}
        totalPages={totalPages}
        loading={loading}
        onPageChange={setPage}
        onPageSizeChange={changePageSize}
      />

      {showForm && (
        <NewAccountModal onClose={() => setShowForm(false)} onCreated={handleCreated} />
      )}
    </div>
  )
}

export default App
