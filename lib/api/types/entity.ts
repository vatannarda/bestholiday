// Entity Types for BestHoliday Accounting Module
// Used for Customers, Hotels, Vehicle Owners, Sub Agencies

export type EntityType = 'customer' | 'hotel' | 'vehicle_owner' | 'sub_agency'

export type Currency = 'TRY' | 'USD' | 'EUR'

export interface Entity {
  id: string
  type: EntityType
  code: string              // Unique: MUS-001, OTL-001, ARC-001
  name: string
  contactName?: string
  phone?: string
  email?: string
  tags?: string[]
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface EntityBalanceSummary {
  entityId: string
  byCurrency: Array<{
    currency: Currency
    receivable: number      // Alacak
    payable: number         // Borç
    net: number             // Net bakiye
  }>
  overdueCount: number      // Gecikmiş hareket sayısı
  upcomingDueCount: number  // Yaklaşan vade sayısı
}

// Request/Response types for API calls
export interface CreateEntityRequest {
  type: EntityType
  name: string
  contactName?: string
  phone?: string
  email?: string
  tags?: string[]
  notes?: string
}

export interface UpdateEntityRequest {
  id: string
  name?: string
  contactName?: string
  phone?: string
  email?: string
  tags?: string[]
  notes?: string
  isActive?: boolean
}

export interface EntitiesListResponse {
  entities: Entity[]
}

export interface EntityResponse {
  entity: Entity
  summary?: EntityBalanceSummary
}

// Entity type labels for UI
export const ENTITY_TYPE_LABELS = {
  customer: { tr: 'Müşteri', en: 'Customer' },
  hotel: { tr: 'Otel', en: 'Hotel' },
  vehicle_owner: { tr: 'Araç Sahibi', en: 'Vehicle Owner' },
  sub_agency: { tr: 'Alt Acenta', en: 'Sub Agency' },
} as const

// Entity code prefixes
export const ENTITY_CODE_PREFIXES: Record<EntityType, string> = {
  customer: 'MUS',
  hotel: 'OTL',
  vehicle_owner: 'ARC',
  sub_agency: 'ACE',
}
