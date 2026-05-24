import { Message } from "@/types"
import { Icon } from "@/components/ui/icon"
import { Markdown } from "@/components/chat/markdown"

function extensionFromDataUrl(url: string): string {
  const match = /^data:image\/([a-zA-Z0-9+.-]+)/.exec(url)
  if (!match) return "png"
  const subtype = match[1].toLowerCase()
  if (subtype === "jpeg") return "jpg"
  if (subtype === "svg+xml") return "svg"
  return subtype
}

function DownloadableImage({
  src,
  filename,
  className = "",
}: {
  src: string
  filename: string
  className?: string
}) {
  return (
    <div className={`relative group inline-block ${className}`}>
      <img
        src={src}
        alt="生成された画像"
        className="rounded-lg max-w-full block"
      />
      <a
        href={src}
        download={filename}
        title="画像をダウンロード"
        className="absolute top-2 right-2 w-8 h-8 grid place-items-center rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity backdrop-blur-sm"
        style={{ background: "rgba(0, 0, 0, 0.55)", color: "#fff" }}
      >
        <Icon name="download" size={16} />
      </a>
    </div>
  )
}

export function MessageRow({ msg }: { msg: Message }) {
  const isUser = msg.role === "user"
  const filename = msg.imageUrl
    ? `generated-${msg.id}.${extensionFromDataUrl(msg.imageUrl)}`
    : ""
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
            <DownloadableImage src={msg.imageUrl} filename={filename} className="mb-1" />
          )}
          {msg.content}
        </div>
      ) : (
        <div
          className="md-body text-[15px] leading-[1.7] break-words"
          style={{ color: "var(--notion-text)" }}
        >
          {msg.imageUrl && (
            <DownloadableImage src={msg.imageUrl} filename={filename} className="mb-3" />
          )}
          <Markdown source={msg.content} />
        </div>
      )}
    </div>
  )
}
