import { NextResponse } from "next/server"
import {
  createContactMessageInDb,
  getContactMessagesFromDb,
  hasMessagesDatabaseConfig,
} from "@/lib/messages-db"

export async function GET() {
  if (!hasMessagesDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing.", messages: [] }, { status: 400 })
  }

  try {
    const messages = await getContactMessagesFromDb()
    return NextResponse.json({ success: true, messages })
  } catch (error) {
    console.error("Failed to fetch contact messages:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch messages.", messages: [] }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!hasMessagesDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing." }, { status: 400 })
  }

  try {
    const body = await req.json()
    const name = String(body?.name ?? "").trim()
    const email = String(body?.email ?? "").trim()
    const subject = String(body?.subject ?? "").trim()
    const message = String(body?.message ?? "").trim()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Required fields: name, email, subject, message." },
        { status: 400 },
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email format." }, { status: 400 })
    }

    const created = await createContactMessageInDb({ name, email, subject, message })
    return NextResponse.json({ success: true, message: created }, { status: 201 })
  } catch (error) {
    console.error("Failed to create contact message:", error)
    return NextResponse.json({ success: false, message: "Failed to send message." }, { status: 500 })
  }
}
