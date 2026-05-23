import { Icon } from "@/components/ui/icon"

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-10 py-10 gap-4">
      <div
        className="w-12 h-12 rounded-full grid place-items-center"
        style={{
          background: "var(--notion-surface-1)",
          color: "var(--notion-accent)",
        }}
      >
        <Icon name="sparkles" size={22} />
      </div>
      <h1
        className="m-0 text-2xl font-semibold"
        style={{ color: "var(--notion-text)" }}
      >
        何から話しましょうか
      </h1>
      <div
        className="text-[14px] max-w-[380px]"
        style={{ color: "var(--notion-text-2)" }}
      >
        モデルを選んで、メッセージを送ってください。
      </div>
    </div>
  )
}
