import { neon } from "@neondatabase/serverless"

export type ProjectCategory = "real" | "personal"
export type ProjectPreviewType = "desktop" | "mobile"
export type I18nText = {
  uz: string
  ru: string
  en: string
}

export interface ProjectRecord {
  id?: number
  category: ProjectCategory
  sortOrder: number
  name: string
  url: string
  img: string
  badge?: string | null
  technologies: string[]
  description: string
  github?: string | null
  admin?: string | null
  imagePublicId?: string | null
  previewType?: ProjectPreviewType
  nameI18n?: I18nText | null
  descriptionI18n?: I18nText | null
  badgeI18n?: I18nText | null
}

export interface CreateProjectInput {
  category: ProjectCategory
  name: string
  url: string
  img: string
  technologies: string[]
  description: string
  badge?: string | null
  github?: string | null
  admin?: string | null
  imagePublicId?: string | null
  previewType?: ProjectPreviewType
  nameI18n?: I18nText | null
  descriptionI18n?: I18nText | null
  badgeI18n?: I18nText | null
}

export interface UpdateProjectInput {
  category: ProjectCategory
  name: string
  url: string
  img: string
  technologies: string[]
  description: string
  badge?: string | null
  github?: string | null
  admin?: string | null
  imagePublicId?: string | null
  previewType?: ProjectPreviewType
  nameI18n?: I18nText | null
  descriptionI18n?: I18nText | null
  badgeI18n?: I18nText | null
}

export type GroupedProjects = {
  real: ProjectRecord[]
  personal: ProjectRecord[]
}

type ProjectRow = {
  id: number
  category: ProjectCategory
  sort_order: number
  name: string
  url: string
  img: string
  badge: string | null
  technologies: string[]
  description: string
  github: string | null
  admin_url: string | null
  image_public_id: string | null
  preview_type: string | null
  name_i18n: unknown | null
  description_i18n: unknown | null
  badge_i18n: unknown | null
}

function getSqlClient() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) return null
  return neon(databaseUrl)
}

export function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL)
}

async function ensureProjectsTable() {
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      img TEXT NOT NULL,
      badge TEXT,
      technologies TEXT[] NOT NULL DEFAULT '{}',
      description TEXT NOT NULL,
      github TEXT,
      admin_url TEXT,
      image_public_id TEXT,
      preview_type TEXT NOT NULL DEFAULT 'desktop',
      name_i18n JSONB,
      description_i18n JSONB,
      badge_i18n JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT projects_unique_name_per_category UNIQUE (category, name)
    )
  `

  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS name_i18n JSONB`
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS description_i18n JSONB`
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS badge_i18n JSONB`
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_public_id TEXT`
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS preview_type TEXT DEFAULT 'desktop'`
  await sql`UPDATE projects SET preview_type = 'desktop' WHERE preview_type IS NULL`
}

function groupProjects(projects: ProjectRecord[]): GroupedProjects {
  return {
    real: projects.filter((project) => project.category === "real"),
    personal: projects.filter((project) => project.category === "personal"),
  }
}

function normalizeI18nText(value: unknown): I18nText | null {
  if (!value || typeof value !== "object") return null

  const asRecord = value as Record<string, unknown>
  const uz = String(asRecord.uz ?? "").trim()
  const ru = String(asRecord.ru ?? "").trim()
  const en = String(asRecord.en ?? "").trim()

  if (!uz && !ru && !en) return null
  return { uz, ru, en }
}

function mapProjectRow(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    category: row.category,
    sortOrder: row.sort_order,
    name: row.name,
    url: row.url,
    img: row.img,
    badge: row.badge,
    technologies: row.technologies ?? [],
    description: row.description,
    github: row.github,
    admin: row.admin_url,
    imagePublicId: row.image_public_id,
    previewType: row.preview_type === "mobile" ? "mobile" : "desktop",
    nameI18n: normalizeI18nText(row.name_i18n),
    descriptionI18n: normalizeI18nText(row.description_i18n),
    badgeI18n: normalizeI18nText(row.badge_i18n),
  }
}

export async function getProjectsGroupedFromDb(): Promise<GroupedProjects> {
  await ensureProjectsTable()

  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const rows = (await sql`
    SELECT
      id,
      category,
      sort_order,
      name,
      url,
      img,
      badge,
      technologies,
      description,
      github,
      admin_url,
      image_public_id,
      preview_type,
      name_i18n,
      description_i18n,
      badge_i18n
    FROM projects
    ORDER BY
      CASE WHEN category = 'real' THEN 0 ELSE 1 END,
      sort_order ASC,
      id ASC
  `) as ProjectRow[]

  const projects = rows.map((row) => mapProjectRow(row))

  return groupProjects(projects)
}

export async function createProjectInDb(input: CreateProjectInput) {
  await ensureProjectsTable()

  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const maxSortOrderRows = (await sql`
    SELECT MAX(sort_order) AS max_sort_order
    FROM projects
    WHERE category = ${input.category}
  `) as Array<{ max_sort_order: number | null }>

  const nextSortOrder = (maxSortOrderRows[0]?.max_sort_order ?? -1) + 1

  const rows = (await sql`
    INSERT INTO projects (
      category, sort_order, name, url, img, badge, technologies, description, github, admin_url, image_public_id, preview_type, name_i18n, description_i18n, badge_i18n
    )
    VALUES (
      ${input.category},
      ${nextSortOrder},
      ${input.name},
      ${input.url},
      ${input.img},
      ${input.badge ?? null},
      ${input.technologies},
      ${input.description},
      ${input.github ?? null},
      ${input.admin ?? null},
      ${input.imagePublicId ?? null},
      ${input.previewType ?? "desktop"},
      ${input.nameI18n ? JSON.stringify(input.nameI18n) : null}::jsonb,
      ${input.descriptionI18n ? JSON.stringify(input.descriptionI18n) : null}::jsonb,
      ${input.badgeI18n ? JSON.stringify(input.badgeI18n) : null}::jsonb
    )
    RETURNING
      id,
      category,
      sort_order,
      name,
      url,
      img,
      badge,
      technologies,
      description,
      github,
      admin_url,
      image_public_id,
      preview_type,
      name_i18n,
      description_i18n,
      badge_i18n
  `) as ProjectRow[]

  const row = rows[0]
  if (!row) {
    throw new Error("Project creation failed")
  }

  return mapProjectRow(row)
}

export async function getProjectByIdFromDb(id: number): Promise<ProjectRecord | null> {
  await ensureProjectsTable()

  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const rows = (await sql`
    SELECT
      id,
      category,
      sort_order,
      name,
      url,
      img,
      badge,
      technologies,
      description,
      github,
      admin_url,
      image_public_id,
      preview_type,
      name_i18n,
      description_i18n,
      badge_i18n
    FROM projects
    WHERE id = ${id}
    LIMIT 1
  `) as ProjectRow[]

  const row = rows[0]
  if (!row) return null

  return mapProjectRow(row)
}

export async function updateProjectInDb(id: number, input: UpdateProjectInput): Promise<ProjectRecord | null> {
  await ensureProjectsTable()

  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const rows = (await sql`
    UPDATE projects
    SET
      category = ${input.category},
      name = ${input.name},
      url = ${input.url},
      img = ${input.img},
      badge = ${input.badge ?? null},
      technologies = ${input.technologies},
      description = ${input.description},
      github = ${input.github ?? null},
      admin_url = ${input.admin ?? null},
      image_public_id = ${input.imagePublicId ?? null},
      preview_type = ${input.previewType ?? "desktop"},
      name_i18n = ${input.nameI18n ? JSON.stringify(input.nameI18n) : null}::jsonb,
      description_i18n = ${input.descriptionI18n ? JSON.stringify(input.descriptionI18n) : null}::jsonb,
      badge_i18n = ${input.badgeI18n ? JSON.stringify(input.badgeI18n) : null}::jsonb,
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id,
      category,
      sort_order,
      name,
      url,
      img,
      badge,
      technologies,
      description,
      github,
      admin_url,
      image_public_id,
      preview_type,
      name_i18n,
      description_i18n,
      badge_i18n
  `) as ProjectRow[]

  const row = rows[0]
  if (!row) return null

  return mapProjectRow(row)
}

export async function deleteProjectInDb(id: number): Promise<boolean> {
  await ensureProjectsTable()

  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const rows = (await sql`
    DELETE FROM projects
    WHERE id = ${id}
    RETURNING id
  `) as Array<{ id: number }>

  return rows.length > 0
}
