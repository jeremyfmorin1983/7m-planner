export const DEPARTMENTS = [
  'Admin','Business','Care & Assimilation','College','Communications',
  'Facility','Groups','IT','Kids','Missions','Pastoral','Preteen',
  'Production','Students','Worship',
]

export const ASSET_TYPES = ['Audio','Computers','Lighting','Other','Power','Video']

// Phase|Category pairs per table per department
// Format: "Phase | Category"
const CONTRACTS_PHASE_CAT: Record<string, string[]> = {
  'Facility':           ['Fixed Expenses | Facilities'],
  'Missions':           ['Fixed Expenses | Missions','Ministry, Planning, & Dreaming | Missions'],
  'Admin':              ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations'],
  'Business':           ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations'],
  'Care & Assimilation':['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations'],
  'College':            ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations'],
  'Communications':     ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations'],
  'Groups':             ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations'],
  'IT':                 ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations'],
  'Kids':               ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations'],
  'Pastoral':           ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations'],
  'Preteen':            ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations'],
  'Production':         ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations'],
  'Students':           ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations'],
  'Worship':            ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations'],
}

const ASSETS_PHASE_CAT: Record<string, string[]> = {
  'Business':  ['Fixed Expenses | Depreciation','Fixed Expenses | Operations'],
  'IT':        ['Fixed Expenses | Depreciation'],
  'Production':['Fixed Expenses | Depreciation','Fixed Expenses | Operations'],
}

const OTHER_PHASE_CAT: Record<string, string[]> = {
  'Facility':           ['Fixed Expenses | Facilities','Ministry, Planning, & Dreaming | Facilities','Volunteer Leadership Development | Facilities','Personal / Professional Development | Facilities','Emergency Fund / Discretionary Reserves | Facilities'],
  'Missions':           ['Fixed Expenses | Missions','Ministry, Planning, & Dreaming | Missions','Volunteer Leadership Development | Missions','Personal / Professional Development | Missions','Emergency Fund / Discretionary Reserves | Missions'],
  'Admin':              ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations','Volunteer Leadership Development | Operations','Personal / Professional Development | Operations','Emergency Fund / Discretionary Reserves | Operations'],
  'Business':           ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations','Volunteer Leadership Development | Operations','Personal / Professional Development | Operations','Emergency Fund / Discretionary Reserves | Operations'],
  'Care & Assimilation':['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations','Volunteer Leadership Development | Operations','Personal / Professional Development | Operations','Emergency Fund / Discretionary Reserves | Operations'],
  'College':            ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations','Volunteer Leadership Development | Operations','Personal / Professional Development | Operations','Emergency Fund / Discretionary Reserves | Operations'],
  'Communications':     ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations','Volunteer Leadership Development | Operations','Personal / Professional Development | Operations','Emergency Fund / Discretionary Reserves | Operations'],
  'Groups':             ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations','Volunteer Leadership Development | Operations','Personal / Professional Development | Operations','Emergency Fund / Discretionary Reserves | Operations'],
  'IT':                 ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations','Volunteer Leadership Development | Operations','Personal / Professional Development | Operations','Emergency Fund / Discretionary Reserves | Operations'],
  'Kids':               ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations','Volunteer Leadership Development | Operations','Personal / Professional Development | Operations','Emergency Fund / Discretionary Reserves | Operations'],
  'Pastoral':           ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations','Volunteer Leadership Development | Operations','Personal / Professional Development | Operations','Emergency Fund / Discretionary Reserves | Operations'],
  'Preteen':            ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations','Volunteer Leadership Development | Operations','Personal / Professional Development | Operations','Emergency Fund / Discretionary Reserves | Operations'],
  'Production':         ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations','Volunteer Leadership Development | Operations','Personal / Professional Development | Operations','Emergency Fund / Discretionary Reserves | Operations'],
  'Students':           ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations','Volunteer Leadership Development | Operations','Personal / Professional Development | Operations','Emergency Fund / Discretionary Reserves | Operations'],
  'Worship':            ['Fixed Expenses | Operations','Ministry, Planning, & Dreaming | Operations','Volunteer Leadership Development | Operations','Personal / Professional Development | Operations','Emergency Fund / Discretionary Reserves | Operations'],
}

const TABLE_MAP: Record<string, Record<string, string[]>> = {
  contracts:   CONTRACTS_PHASE_CAT,
  assets:      ASSETS_PHASE_CAT,
  other_items: OTHER_PHASE_CAT,
}

export function getPhases(table: string, dept: string): string[] {
  const pairs = TABLE_MAP[table]?.[dept] ?? []
  return [...new Set(pairs.map(p => p.split(' | ')[0]))]
}

export function getCategories(table: string, dept: string, phase: string): string[] {
  const pairs = TABLE_MAP[table]?.[dept] ?? []
  return pairs
    .filter(p => p.startsWith(phase + ' | '))
    .map(p => p.split(' | ')[1])
}

export function getDepts(table: string): string[] {
  const map = TABLE_MAP[table]
  return map ? Object.keys(map) : DEPARTMENTS
}
