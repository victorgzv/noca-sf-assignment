import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewAccountModal } from '../../components/NewAccountModal'
import * as accountsApi from '../../api/accounts'

describe('NewAccountModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('requires a name before submitting', async () => {
    const user = userEvent.setup()
    const createSpy = vi.spyOn(accountsApi, 'createAccount')
    render(<NewAccountModal onClose={vi.fn()} onCreated={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(createSpy).not.toHaveBeenCalled()
  })

  it('submits trimmed, non-empty fields and calls onCreated', async () => {
    const user = userEvent.setup()
    const createSpy = vi
      .spyOn(accountsApi, 'createAccount')
      .mockResolvedValue({ id: '001abc' })
    const onCreated = vi.fn()

    render(<NewAccountModal onClose={vi.fn()} onCreated={onCreated} />)

    await user.type(screen.getByLabelText('Name *'), '  Acme Corp  ')
    await user.type(screen.getByLabelText('Industry'), 'Technology')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(onCreated).toHaveBeenCalled())
    expect(createSpy).toHaveBeenCalledWith({ Name: 'Acme Corp', Industry: 'Technology' })
  })

  it('shows the API error message and does not close on failure', async () => {
    const user = userEvent.setup()
    vi.spyOn(accountsApi, 'createAccount').mockRejectedValue(
      new Error('Required field missing: Name')
    )
    const onCreated = vi.fn()

    render(<NewAccountModal onClose={vi.fn()} onCreated={onCreated} />)

    await user.type(screen.getByLabelText('Name *'), 'Acme Corp')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Required field missing: Name')).toBeInTheDocument()
    expect(onCreated).not.toHaveBeenCalled()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<NewAccountModal onClose={onClose} onCreated={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })
})
