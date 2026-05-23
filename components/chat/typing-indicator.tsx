import { Icon } from "@/components/ui/icon"

export function TypingIndicator() {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex items-center gap-2 px-0.5 text-[12px]"
        style={{ color: "var(--notion-text-3)" }}
      >
        <span
          className="w-[22px] h-[22px] rounded-full grid place-items-center text-[11px] font-semibold"
          style={{ background: "var(--notion-text)", color: "var(--notion-bg)" }}
        >
          <Icon name="sparkles" size={13} />
        </span>
        <span className="font-medium" style={{ color: "var(--notion-text-2)" }}>
          アシスタント
        </span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-3">
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: "var(--notion-text-3)", animationDelay: "0ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: "var(--notion-text-3)", animationDelay: "150ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: "var(--notion-text-3)", animationDelay: "300ms" }}
        />
      </div>
    </div>
  )
}
