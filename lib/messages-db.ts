import { neon } from "@neondatabase/serverless"

export interface ContactMessageRecord {
  id: number
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

export interface CreateContactMessageInput {
  name: string
  email: string
  subject: string
  message: string
}

type ContactMessageRow = {
  id: number
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

function getSqlClient() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) return null
  return neon(databaseUrl)
}

export function hasMessagesDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL)
}

async function ensureMessagesTable() {
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

export async function getContactMessagesFromDb(): Promise<ContactMessageRecord[]> {
  await ensureMessagesTable()
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const rows = (await sql`
    SELECT id, name, email, subject, message, created_at
    FROM contact_messages
    ORDER BY created_at DESC, id DESC
  `) as ContactMessageRow[]

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at,
  }))
}

export async function createContactMessageInDb(input: CreateContactMessageInput): Promise<ContactMessageRecord> {
  await ensureMessagesTable()
  const sql = getSqlClient()
  if (!sql) {
    throw new Error("DATABASE_URL is not configured")
  }

  const rows = (await sql`
    INSERT INTO contact_messages (name, email, subject, message)
    VALUES (${input.name}, ${input.email}, ${input.subject}, ${input.message})
    RETURNING id, name, email, subject, message, created_at
  `) as ContactMessageRow[]

  const row = rows[0]
  if (!row) {
    throw new Error("Message creation failed")
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at,
  }
}
