export interface Account {
  Id: string
  Name: string
  Industry: string | null
  Phone: string | null
  Website: string | null
  BillingCity: string | null
  BillingCountry: string | null
}

export interface AccountsResponse {
  records: Account[]
  page: number
  pageSize: number
  totalSize: number
  totalPages: number
}

export interface NewAccountInput {
  Name: string
  Industry?: string
  Phone?: string
  Website?: string
  BillingCity?: string
  BillingCountry?: string
}
