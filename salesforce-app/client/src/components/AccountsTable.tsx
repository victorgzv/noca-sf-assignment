import type { Account } from '../types'

interface AccountsTableProps {
  accounts: Account[]
  loading: boolean
}

export function AccountsTable({ accounts, loading }: AccountsTableProps) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Industry</th>
            <th>Phone</th>
            <th>Website</th>
            <th>City</th>
            <th>Country</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="empty-cell">
                Loading…
              </td>
            </tr>
          ) : accounts.length === 0 ? (
            <tr>
              <td colSpan={6} className="empty-cell">
                No accounts found.
              </td>
            </tr>
          ) : (
            accounts.map((account) => <AccountRow key={account.Id} account={account} />)
          )}
        </tbody>
      </table>
    </div>
  )
}

function AccountRow({ account }: { account: Account }) {
  return (
    <tr>
      <td>{account.Name}</td>
      <td>{account.Industry || '—'}</td>
      <td>{account.Phone || '—'}</td>
      <td>
        {account.Website ? (
          <a href={account.Website} target="_blank" rel="noreferrer">
            {account.Website}
          </a>
        ) : (
          '—'
        )}
      </td>
      <td>{account.BillingCity || '—'}</td>
      <td>{account.BillingCountry || '—'}</td>
    </tr>
  )
}
