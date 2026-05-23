import { Message } from "@/types"
import { Icon } from "@/components/ui/icon"
import { Markdown } from "@/components/chat/markdown"

export function MessageRow({ msg }: { msg: Message }) {
  const isUser = msg.role === "user"
  return (
    <div className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-stretch"}`}>
      <div
        className={`flex items-center gap-2 px-0.5 text-[12px] ${isUser ? "flex-row-reverse" : ""}`}
        style={{ color: "var(--notion-text-3)" }}
      >
        <span
          className="w-[22px] h-[22px] rounded-full grid place-items-center text-[11px] font-semibold text-white"
          style={{
            background: isUser
              ? "linear-gradient(135deg, #f6b75c, #e07c41)"
              : "var(--notion-text)",
            color: isUser ? "#fff" : "var(--notion-bg)",
          }}
        >
          {isUser ? "T" : <Icon name="sparkles" size={13} />}
        </span>
        <span className="font-medium" style={{ color: "var(--notion-text-2)" }}>
          {isUser ? "あなた" : "アシスタント"}
        </span>
        <span>{msg.time}</span>
      </div>
      {isUser ? (
        <div
          className="max-w-[88%] px-3.5 py-2.5 rounded-[10px] text-[15px] leading-[1.55] whitespace-pre-wrap break-words"
          style={{
            background: "var(--notion-bubble)",
            color: "var(--notion-text)",
          }}
        >
          {msg.imageUrl && (
            <img
              src={msg.imageUrl}
              alt="生成された画像"
              className="rounded-lg max-w-full mb-1"
            />
          )}
          {msg.content}
        </div>
      ) : (
        <div
          className="md-body text-[15px] leading-[1.7] break-words"
          style={{ color: "var(--notion-text)" }}
        >
          {msg.imageUrl && (
            <img
              src={msg.imageUrl}
              alt="生成された画像"
              className="rounded-lg max-w-full mb-3"
            />
          )}
          <Markdown source={msg.content} />
        </div>
      )}
    </div>
  )
}
