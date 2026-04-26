import { neon } from "@neondatabase/serverless"
import {
  normalizeSkillCategory,
  normalizeSkillSubcategory,
  SkillCategory,
  SkillSubcategory,
} from "@/lib/skills-categories"

export interface SkillRecord {
  id: number
  name: string
  nameI18n: {
    uz: string
    ru: string
    en: string
  } | null
  img: string
  imagePublicId: string | null
  category: SkillCategory
  subcategory: SkillSubcategory | null
  sortOrder: number
}

export interface CreateSkillInput {
  name: string
  nameI18n?: {
    uz: string
    ru: string
    en: string
  } | null
  img?: string
  imagePublicId?: string | null
  category?: SkillCategory
  subcategory?: SkillSubcategory | null
}

export interface UpdateSkillInput {
  name: string
  nameI18n?: {
    uz: string
    ru: string
    en: string
  } | null
  img: string
  imagePublicId?: string | null
  category?: SkillCategory
  subcategory?: SkillSubcategory | null
}

type SkillRow = {
  id: number
  name: string
  name_i18n: unknown | null
  img: string
  image_public_id: string | null
  category: string
  subcategory: string | null
  sort_order: number
}

function getSqlClient() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) return null
  return neon(databaseUrl)
}

export function hasSkillsDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL)
}

async function ensureSkillsTable() {
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  await sql`
    CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      name_i18n JSONB,
      img TEXT NOT NULL DEFAULT '/placeholder.svg',
      image_public_id TEXT,
      category TEXT NOT NULL DEFAULT 'BACKEND_ENGINEERING',
      subcategory TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`ALTER TABLE skills ADD COLUMN IF NOT EXISTS image_public_id TEXT`
  await sql`ALTER TABLE skills ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'BACKEND_ENGINEERING'`
  await sql`ALTER TABLE skills ADD COLUMN IF NOT EXISTS subcategory TEXT`
  await sql`ALTER TABLE skills ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0`
  await sql`ALTER TABLE skills ADD COLUMN IF NOT EXISTS name_i18n JSONB`

  await sql`
    UPDATE skills
    SET category = CASE
      WHEN category = 'FRONTEND' THEN 'FRONTEND_ENGINEERING'
      WHEN category = 'MOBILE DEVELOPMENT' THEN 'MOBILE_DEVELOPMENT'
      WHEN category = 'BACKEND' THEN 'BACKEND_ENGINEERING'
      WHEN category = 'OTHERS' THEN 'ARCHITECTURE_PRACTICES'
      WHEN category = 'DEVOPS & TOOLING' THEN 'DEVOPS_TOOLING'
      WHEN category = 'CLOUD & SERVICES' THEN 'CLOUD_SERVICES'
      WHEN category = 'ARCHITECTURE & PRACTICES' THEN 'ARCHITECTURE_PRACTICES'
      ELSE category
    END
  `

  await sql`
    UPDATE skills
    SET subcategory = CASE
      WHEN subcategory = 'BASIC' THEN 'CORE_TECHNOLOGIES'
      WHEN subcategory = 'FRAMEWORKS_STATE' THEN 'FRAMEWORKS_LIBRARIES'
      WHEN subcategory = 'UI_DESIGN' THEN 'UI_STYLING'
      ELSE subcategory
    END
  `

  await sql`
    UPDATE skills
    SET subcategory = 'CORE_TECHNOLOGIES'
    WHERE category = 'FRONTEND_ENGINEERING' AND (subcategory IS NULL OR TRIM(subcategory) = '')
  `

  await sql`UPDATE skills SET subcategory = NULL WHERE category <> 'FRONTEND_ENGINEERING'`

  const stats = (await sql`
    SELECT COUNT(*)::int AS total_count, COUNT(*) FILTER (WHERE sort_order <> 0)::int AS configured_count
    FROM skills
  `) as Array<{ total_count: number; configured_count: number }>

  const totalCount = Number(stats[0]?.total_count ?? 0)
  const configuredCount = Number(stats[0]?.configured_count ?? 0)

  if (totalCount > 0 && configuredCount === 0) {
    await sql`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id DESC) AS row_num
        FROM skills
      )
      UPDATE skills AS s
      SET sort_order = ranked.row_num
      FROM ranked
      WHERE s.id = ranked.id
    `
  }
}

function normalizeSkillNameI18n(value: unknown) {
  if (!value || typeof value !== "object") return null
  const source = value as Record<string, unknown>
  const uz = String(source.uz ?? "").trim()
  const ru = String(source.ru ?? "").trim()
  const en = String(source.en ?? "").trim()
  if (!uz && !ru && !en) return null
  return { uz, ru, en }
}

export async function getSkillsFromDb(): Promise<SkillRecord[]> {
  await ensureSkillsTable()
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const rows = (await sql`
    SELECT id, name, name_i18n, img, image_public_id, category, subcategory, sort_order
    FROM skills
    ORDER BY sort_order ASC, id ASC
  `) as SkillRow[]

  return rows.map((row) => ({
    category: normalizeSkillCategory(row.category),
    id: row.id,
    name: row.name,
    nameI18n: normalizeSkillNameI18n(row.name_i18n),
    img: row.img,
    imagePublicId: row.image_public_id,
    subcategory: normalizeSkillSubcategory(row.subcategory, normalizeSkillCategory(row.category)),
    sortOrder: row.sort_order,
  }))
}

export async function getSkillByIdFromDb(id: number): Promise<SkillRecord | null> {
  await ensureSkillsTable()
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const rows = (await sql`
    SELECT id, name, name_i18n, img, image_public_id, category, subcategory, sort_order
    FROM skills
    WHERE id = ${id}
    LIMIT 1
  `) as SkillRow[]

  const row = rows[0]
  if (!row) return null
  const category = normalizeSkillCategory(row.category)
  return {
    id: row.id,
    name: row.name,
    nameI18n: normalizeSkillNameI18n(row.name_i18n),
    img: row.img,
    imagePublicId: row.image_public_id,
    category,
    subcategory: normalizeSkillSubcategory(row.subcategory, category),
    sortOrder: row.sort_order,
  }
}

export async function createSkillInDb(input: CreateSkillInput): Promise<SkillRecord> {
  await ensureSkillsTable()
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const maxSortRows = (await sql`
    SELECT COALESCE(MAX(sort_order), 0)::int AS max_sort_order
    FROM skills
  `) as Array<{ max_sort_order: number }>
  const nextSortOrder = Number(maxSortRows[0]?.max_sort_order ?? 0) + 1
  const category = normalizeSkillCategory(input.category)
  const subcategory = normalizeSkillSubcategory(input.subcategory, category)

  const rows = (await sql`
    INSERT INTO skills (name, name_i18n, img, image_public_id, category, subcategory, sort_order)
    VALUES (
      ${input.name},
      ${input.nameI18n ? JSON.stringify(input.nameI18n) : null}::jsonb,
      ${input.img ?? "/placeholder.svg"},
      ${input.imagePublicId ?? null},
      ${category},
      ${subcategory},
      ${nextSortOrder}
    )
    RETURNING id, name, name_i18n, img, image_public_id, category, subcategory, sort_order
  `) as SkillRow[]

  const row = rows[0]
  if (!row) {
    throw new Error("Skill creation failed")
  }

  const normalizedCategory = normalizeSkillCategory(row.category)
  return {
    id: row.id,
    name: row.name,
    nameI18n: normalizeSkillNameI18n(row.name_i18n),
    img: row.img,
    imagePublicId: row.image_public_id,
    category: normalizedCategory,
    subcategory: normalizeSkillSubcategory(row.subcategory, normalizedCategory),
    sortOrder: row.sort_order,
  }
}

export async function updateSkillInDb(id: number, input: UpdateSkillInput): Promise<SkillRecord | null> {
  await ensureSkillsTable()
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const category = normalizeSkillCategory(input.category)
  const subcategory = normalizeSkillSubcategory(input.subcategory, category)

  const rows = (await sql`
    UPDATE skills
    SET
      name = ${input.name},
      name_i18n = ${input.nameI18n ? JSON.stringify(input.nameI18n) : null}::jsonb,
      img = ${input.img},
      image_public_id = ${input.imagePublicId ?? null},
      category = ${category},
      subcategory = ${subcategory},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, name, name_i18n, img, image_public_id, category, subcategory, sort_order
  `) as SkillRow[]

  const row = rows[0]
  if (!row) return null

  const normalizedCategory = normalizeSkillCategory(row.category)
  return {
    id: row.id,
    name: row.name,
    nameI18n: normalizeSkillNameI18n(row.name_i18n),
    img: row.img,
    imagePublicId: row.image_public_id,
    category: normalizedCategory,
    subcategory: normalizeSkillSubcategory(row.subcategory, normalizedCategory),
    sortOrder: row.sort_order,
  }
}

export async function reorderSkillsInDb(orderedIds: number[]): Promise<void> {
  await ensureSkillsTable()

  if (orderedIds.length === 0) return

  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  for (let index = 0; index < orderedIds.length; index += 1) {
    await sql`
      UPDATE skills
      SET sort_order = ${index + 1}, updated_at = NOW()
      WHERE id = ${orderedIds[index]}
    `
  }
}

export async function deleteSkillInDb(id: number): Promise<boolean> {
  await ensureSkillsTable()
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const rows = (await sql`
    DELETE FROM skills
    WHERE id = ${id}
    RETURNING id
  `) as Array<{ id: number }>

  return rows.length > 0
}
