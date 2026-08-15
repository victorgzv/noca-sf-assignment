import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '../../components/Pagination'

describe('Pagination', () => {
  it('shows the current range and total', () => {
    render(
      <Pagination
        page={2}
        pageSize={10}
        totalSize={25}
        totalPages={3}
        loading={false}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    )
    expect(screen.getByText('Showing 11–20 of 25')).toBeInTheDocument()
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
  })

  it('shows a no-results message when totalSize is 0', () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalSize={0}
        totalPages={1}
        loading={false}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    )
    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('disables Previous on the first page and Next on the last page', () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalSize={10}
        totalPages={1}
        loading={false}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('calls onPageChange with the next/previous page number', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <Pagination
        page={2}
        pageSize={10}
        totalSize={30}
        totalPages={3}
        loading={false}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPageChange).toHaveBeenCalledWith(3)

    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('calls onPageSizeChange when the rows-per-page select changes', async () => {
    const user = userEvent.setup()
    const onPageSizeChange = vi.fn()
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalSize={100}
        totalPages={10}
        loading={false}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />
    )

    await user.selectOptions(screen.getByLabelText('Rows per page'), '25')
    expect(onPageSizeChange).toHaveBeenCalledWith(25)
  })
})
