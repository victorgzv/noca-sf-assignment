import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AccountsTable } from '../../components/AccountsTable'
import type { Account } from '../../types'

const account: Account = {
  Id: '001',
  Name: 'Acme Corp',
  Industry: 'Technology',
  Phone: '555-0100',
  Website: 'https://acme.example',
  BillingCity: 'Austin',
  BillingCountry: 'USA',
}

describe('AccountsTable', () => {
  it('shows a loading row while loading', () => {
    render(<AccountsTable accounts={[]} loading={true} />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows an empty state when there are no accounts', () => {
    render(<AccountsTable accounts={[]} loading={false} />)
    expect(screen.getByText('No accounts found.')).toBeInTheDocument()
  })

  it('renders account fields, falling back to em-dash for nulls', () => {
    const sparse: Account = {
      Id: '002',
      Name: 'No Details Inc',
      Industry: null,
      Phone: null,
      Website: null,
      BillingCity: null,
      BillingCountry: null,
    }
    render(<AccountsTable accounts={[account, sparse]} loading={false} />)

    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'https://acme.example' })).toHaveAttribute(
      'href',
      'https://acme.example'
    )

    expect(screen.getByText('No Details Inc')).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})
