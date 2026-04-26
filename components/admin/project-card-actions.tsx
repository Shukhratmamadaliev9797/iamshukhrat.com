"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

type ProjectCardActionsProps = {
  projectId: number
  onDeleted?: () => void
}

export function ProjectCardActions({ projectId, onDeleted }: ProjectCardActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm("Bu projectni o'chirasizmi?")
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })
      const payload = await res.json()
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Delete xatoligi.")
      }
      onDeleted?.()
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Delete amalga oshmadi.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/admin/projects/${projectId}/edit`}
        className="inline-flex items-center justify-center rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-secondary"
      >
        Edit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center justify-center rounded-md border border-red-500/40 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  )
}
