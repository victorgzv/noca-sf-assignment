import { useState, type ChangeEvent, type FormEvent } from 'react'
import { createAccount } from '../api/accounts'
import { ErrorBanner } from './ErrorBanner'

const EMPTY_FORM = {
  Name: '',
  Industry: '',
  Phone: '',
  Website: '',
  BillingCity: '',
  BillingCountry: '',
}

type FormFields = typeof EMPTY_FORM

interface NewAccountModalProps {
  onClose: () => void
  onCreated: () => void
}

export function NewAccountModal({ onClose, onCreated }: NewAccountModalProps) {
  const [form, setForm] = useState<FormFields>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function updateField(field: keyof FormFields) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
    }
  }

  function handleOverlayClick() {
    if (!submitting) onClose()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.Name.trim()) {
      setFormError('Name is required')
      return
    }

    setSubmitting(true)
    setFormError(null)
    try {
      const input: Record<string, string> = {}
      for (const [key, value] of Object.entries(form)) {
        if (value.trim()) input[key] = value.trim()
      }
      await createAccount(input as FormFields)
      onCreated()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-account-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="new-account-title">New Account</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name *
            <input value={form.Name} onChange={updateField('Name')} autoFocus />
          </label>
          <label>
            Industry
            <input value={form.Industry} onChange={updateField('Industry')} />
          </label>
          <label>
            Phone
            <input value={form.Phone} onChange={updateField('Phone')} />
          </label>
          <label>
            Website
            <input value={form.Website} onChange={updateField('Website')} />
          </label>
          <label>
            Billing City
            <input value={form.BillingCity} onChange={updateField('BillingCity')} />
          </label>
          <label>
            Billing Country
            <input value={form.BillingCountry} onChange={updateField('BillingCountry')} />
          </label>

          {formError && <ErrorBanner message={formError} />}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
