import { neon } from "@neondatabase/serverless"
import { normalizeSkillCategory, SkillCategory } from "@/lib/skills-categories"

export interface SkillRecord {
  id: number
  name: string
  img: string
  imagePublicId: string | null
  category: SkillCategory
}

export interface CreateSkillInput {
  name: string
  img?: string
  imagePublicId?: string | null
  category?: SkillCategory
}

export interface UpdateSkillInput {
  name: string
  img: string
  imagePublicId?: string | null
  category?: SkillCategory
}

type SkillRow = {
  id: number
  name: string
  img: string
  image_public_id: string | null
  category: string
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
      img TEXT NOT NULL DEFAULT '/placeholder.svg',
      image_public_id TEXT,
      category TEXT NOT NULL DEFAULT 'OTHERS',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`ALTER TABLE skills ADD COLUMN IF NOT EXISTS image_public_id TEXT`
  await sql`ALTER TABLE skills ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'OTHERS'`
}

export async function getSkillsFromDb(): Promise<SkillRecord[]> {
  await ensureSkillsTable()
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const rows = (await sql`
    SELECT id, name, img, image_public_id, category
    FROM skills
    ORDER BY id DESC
  `) as SkillRow[]

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    img: row.img,
    imagePublicId: row.image_public_id,
    category: normalizeSkillCategory(row.category),
  }))
}

export async function getSkillByIdFromDb(id: number): Promise<SkillRecord | null> {
  await ensureSkillsTable()
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const rows = (await sql`
    SELECT id, name, img, image_public_id, category
    FROM skills
    WHERE id = ${id}
    LIMIT 1
  `) as SkillRow[]

  const row = rows[0]
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    img: row.img,
    imagePublicId: row.image_public_id,
    category: normalizeSkillCategory(row.category),
  }
}

export async function createSkillInDb(input: CreateSkillInput): Promise<SkillRecord> {
  await ensureSkillsTable()
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const rows = (await sql`
    INSERT INTO skills (name, img, image_public_id, category)
    VALUES (
      ${input.name},
      ${input.img ?? "/placeholder.svg"},
      ${input.imagePublicId ?? null},
      ${input.category ?? "OTHERS"}
    )
    RETURNING id, name, img, image_public_id, category
  `) as SkillRow[]

  const row = rows[0]
  if (!row) {
    throw new Error("Skill creation failed")
  }

  return {
    id: row.id,
    name: row.name,
    img: row.img,
    imagePublicId: row.image_public_id,
    category: normalizeSkillCategory(row.category),
  }
}

export async function updateSkillInDb(id: number, input: UpdateSkillInput): Promise<SkillRecord | null> {
  await ensureSkillsTable()
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const rows = (await sql`
    UPDATE skills
    SET
      name = ${input.name},
      img = ${input.img},
      image_public_id = ${input.imagePublicId ?? null},
      category = ${input.category ?? "OTHERS"},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, name, img, image_public_id, category
  `) as SkillRow[]

  const row = rows[0]
  if (!row) return null

  return {
    id: row.id,
    name: row.name,
    img: row.img,
    imagePublicId: row.image_public_id,
    category: normalizeSkillCategory(row.category),
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
