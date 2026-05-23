import { Fragment, ReactNode } from "react"

function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const t = m[0]
    if (t.startsWith("**")) {
      out.push(<strong key={`b-${m.index}`}>{t.slice(2, -2)}</strong>)
    } else {
      out.push(<code key={`c-${m.index}`}>{t.slice(1, -1)}</code>)
    }
    last = m.index + t.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function renderBlock(text: string, key: number): ReactNode {
  const blocks = text.split(/\n{2,}/).filter(Boolean)
  return (
    <Fragment key={key}>
      {blocks.map((b, i) => {
        const lines = b.split("\n")
        if (lines.length === 1 && /^###\s+/.test(lines[0])) {
          return <h3 key={i}>{renderInline(lines[0].replace(/^###\s+/, ""))}</h3>
        }
        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^\s*[-*]\s+/, ""))}</li>
              ))}
            </ul>
          )
        }
        if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
          return (
            <ol key={i}>
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^\s*\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={i}>
            {lines.flatMap((l, j) =>
              j === 0
                ? renderInline(l)
                : [<br key={`br${j}`} />, ...renderInline(l)],
            )}
          </p>
        )
      })}
    </Fragment>
  )
}

export function Markdown({ source }: { source: string }) {
  if (!source) return null
  const parts: { kind: "md" | "code"; text: string }[] = []
  const re = /```(?:[a-z]+)?\n([\s\S]*?)(?:```|$)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    if (m.index > last) parts.push({ kind: "md", text: source.slice(last, m.index) })
    parts.push({ kind: "code", text: m[1] })
    last = m.index + m[0].length
  }
  if (last < source.length) parts.push({ kind: "md", text: source.slice(last) })

  return (
    <>
      {parts.map((p, i) =>
        p.kind === "code" ? (
          <pre key={i}>
            <code>{p.text}</code>
          </pre>
        ) : (
          renderBlock(p.text, i)
        ),
      )}
    </>
  )
}
