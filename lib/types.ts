export const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const
export type Month = typeof MONTHS[number]

export const MONTH_LABELS: Record<Month, string> = {
  jan:'Jan', feb:'Feb', mar:'Mar', apr:'Apr', may:'May', jun:'Jun',
  jul:'Jul', aug:'Aug', sep:'Sep', oct:'Oct', nov:'Nov', dec:'Dec'
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  department: string | null
  is_admin: boolean
}

export interface LaborRow {
  id: string
  budget_dept: string | null
  functional_dept: string | null
  name: string | null
  role: string | null
  start_date: string | null
  total_comp: number | null
  base: number | null
  match_403b: number | null
  cell_phone: number | null
  insurance_fica: number | null
  housing: number | null
  jan: number; feb: number; mar: number; apr: number
  may: number; jun: number; jul: number; aug: number
  sep: number; oct: number; nov: number; dec: number
}

export interface ContractRow {
  id: string
  department: string | null
  phase: string | null
  category: string | null
  type: string | null
  description: string | null
  vendor: string | null
  start_date: string | null
  end_date: string | null
  months: number | null
  contract_amount: number | null
  jan: number; feb: number; mar: number; apr: number
  may: number; jun: number; jul: number; aug: number
  sep: number; oct: number; nov: number; dec: number
}

export interface AssetRow {
  id: string
  department: string | null
  phase: string | null
  category: string | null
  asset_type: string | null
  brand: string | null
  model: string | null
  serial_number: string | null
  comments: string | null
  location_user: string | null
  purchase_date: string | null
  life_in_months: number | null
  refresh_date: string | null
  unit_cost: number | null
  purchase_amount: number | null
  quantity: number | null
  jan: number; feb: number; mar: number; apr: number
  may: number; jun: number; jul: number; aug: number
  sep: number; oct: number; nov: number; dec: number
}

export interface OtherRow {
  id: string
  department: string | null
  phase: string | null
  category: string | null
  item: string | null
  jan: number; feb: number; mar: number; apr: number
  may: number; jun: number; jul: number; aug: number
  sep: number; oct: number; nov: number; dec: number
}
