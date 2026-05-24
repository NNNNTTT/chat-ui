const TZ = "Asia/Tokyo"

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  })
}

function startOfDay(d: Date) {
  const t = new Date(d)
  t.setHours(0, 0, 0, 0)
  return t
}

export function computeBucket(date: Date): "today" | "yesterday" | "lastWeek" {
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000
  const diffDays = Math.floor(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / dayMs,
  )
  if (diffDays <= 0) return "today"
  if (diffDays === 1) return "yesterday"
  return "lastWeek"
}

export function formatUpdatedAt(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "たった今"
  const bucket = computeBucket(date)
  if (bucket === "today") return formatTime(date)
  if (bucket === "yesterday") return "昨日"
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays < 7) return "先週"
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TZ,
  })
}
