"use client"

import { useEffect, useState } from "react"

type ContactMessage = {
  id: number
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date)
}

function isRecent(value: string, nowMs: number | null) {
  if (nowMs === null) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const diffMs = nowMs - date.getTime()
  return diffMs <= 24 * 60 * 60 * 1000
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [nowMs, setNowMs] = useState<number | null>(null)

  useEffect(() => {
    setNowMs(Date.now())
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadMessages() {
      setLoading(true)
      setError("")

      try {
        const response = await fetch("/api/messages", { cache: "no-store" })
        const payload = await response.json()

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Messages yuklab bo'lmadi.")
        }

        if (isMounted) {
          setMessages(payload.messages ?? [])
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Xatolik yuz berdi.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadMessages()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Contact page orqali yuborilgan xabarlar ro'yxati.</p>
      </div>

      {!loading ? (
        <div className="rounded-xl border border-border bg-card/30 p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full border border-border bg-background px-3 py-1">
              Jami: <strong>{messages.length}</strong>
            </span>
            <span className="rounded-full border border-border bg-background px-3 py-1">
              Oxirgi 24 soat: <strong>{messages.filter((item) => isRecent(item.createdAt, nowMs)).length}</strong>
            </span>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {loading ? (
        <div className="rounded-xl border border-border bg-card/30 p-6 text-sm text-muted-foreground">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-border bg-card/30 p-6 text-sm text-muted-foreground">
          Hozircha message yo'q.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((item, index) => (
            <article key={item.id} className="rounded-xl border border-border bg-card/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                      #{messages.length - index}
                    </span>
                    {isRecent(item.createdAt, nowMs) ? (
                      <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                        New
                      </span>
                    ) : null}
                  </div>
                  <h2 className="text-base font-semibold text-foreground">{item.subject}</h2>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(item.createdAt)}</p>
              </div>

              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">From</dt>
                  <dd className="text-foreground">{item.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd>
                    <a href={`mailto:${item.email}`} className="text-foreground underline underline-offset-2 hover:text-primary">
                      {item.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Date</dt>
                  <dd className="text-foreground">{formatDateTime(item.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Message ID</dt>
                  <dd className="font-mono text-foreground">{item.id}</dd>
                </div>
              </dl>

              <div className="mt-3 rounded-lg border border-border bg-background/70 p-3">
                <p className="whitespace-pre-wrap text-sm text-foreground/90">{item.message}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
