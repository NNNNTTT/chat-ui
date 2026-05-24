"use client"

import { ChatSettings, ImageSize, LLM, LLMID } from "@/types"
import { Icon } from "@/components/ui/icon"

interface SettingsPanelProps {
  settings: ChatSettings
  onChange: (patch: Partial<ChatSettings>) => void
  theme: "light" | "dark"
  onToggleTheme: () => void
  models: LLM[]
  onClose: () => void
}

const IMAGE_SIZES: { value: ImageSize; label: string }[] = [
  { value: "auto", label: "自動" },
  { value: "1024x1024", label: "1024 × 1024" },
  { value: "1024x1536", label: "1024 × 1536" },
  { value: "1536x1024", label: "1536 × 1024" },
]

export function SettingsPanel({
  settings,
  onChange,
  theme,
  onToggleTheme,
  models,
  onClose,
}: SettingsPanelProps) {
  const noLimit = settings.maxOutputTokens === null

  return (
    <aside
      className="flex flex-col min-w-[260px] h-full"
      style={{ background: "var(--notion-sidebar)" }}
      aria-label="設定"
    >
      {/* Header */}
      <div className="flex items-center px-3 pt-2.5 pb-1.5 h-11 shrink-0">
        <h2 className="font-semibold text-[14px] flex-1" style={{ color: "var(--notion-text)" }}>
          設定
        </h2>
        <button
          onClick={onClose}
          title="閉じる"
          className="w-7 h-7 grid place-items-center rounded hover:bg-[var(--notion-hover)]"
          style={{ color: "var(--notion-text-2)" }}
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 min-h-0 overflow-y-auto notion-scroll px-3 py-2 flex flex-col gap-4">
        <Section label="システムプロンプト設定">
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => onChange({ systemPrompt: e.target.value })}
            placeholder="例: あなたは親切で優秀なAIアシスタントです。"
            rows={4}
            className="w-full text-[13px] leading-[1.5] rounded-md border px-2.5 py-2 resize-none outline-none transition-shadow focus:shadow-[var(--notion-shadow-sm)] focus:border-[var(--notion-border-focus)]"
            style={{
              background: "var(--notion-input)",
              borderColor: "var(--notion-input-border)",
              color: "var(--notion-text)",
            }}
          />
        </Section>

        <Section label="デフォルトモデル">
          <NativeSelect
            value={settings.defaultModel}
            onChange={(v) => onChange({ defaultModel: v as LLMID })}
            options={models.map((m) => ({ value: m.modelId, label: m.modelName }))}
          />
        </Section>

        <Section label="テーマ">
          <ThemePill theme={theme} onToggle={onToggleTheme} />
        </Section>

        <Section
          label="Temperature"
          right={
            <span className="text-[12px]" style={{ color: "var(--notion-text-2)" }}>
              {settings.temperature.toFixed(1)}
            </span>
          }
        >
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={settings.temperature}
            onChange={(e) => onChange({ temperature: Number(e.target.value) })}
            className="w-full accent-[var(--notion-accent)]"
          />
        </Section>

        <Section label="出力上限">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={noLimit ? "" : settings.maxOutputTokens ?? ""}
              placeholder="無制限"
              onChange={(e) => {
                const v = e.target.value
                if (v === "") onChange({ maxOutputTokens: null })
                else onChange({ maxOutputTokens: Math.max(1, Number(v)) })
              }}
              disabled={noLimit}
              className="flex-1 text-[13px] rounded-md border px-2.5 py-1.5 outline-none transition-shadow focus:shadow-[var(--notion-shadow-sm)] focus:border-[var(--notion-border-focus)] disabled:opacity-50"
              style={{
                background: "var(--notion-input)",
                borderColor: "var(--notion-input-border)",
                color: "var(--notion-text)",
              }}
            />
            <label
              className="flex items-center gap-1 text-[11px] cursor-pointer select-none"
              style={{ color: "var(--notion-text-2)" }}
            >
              <input
                type="checkbox"
                checked={noLimit}
                onChange={(e) =>
                  onChange({ maxOutputTokens: e.target.checked ? null : 1024 })
                }
                className="accent-[var(--notion-accent)]"
              />
              無制限
            </label>
          </div>
        </Section>

        <Section label="画像のデフォルトサイズ">
          <NativeSelect
            value={settings.imageSize}
            onChange={(v) => onChange({ imageSize: v as ImageSize })}
            options={IMAGE_SIZES}
          />
        </Section>
      </div>

      {/* Footer */}
      <div className="px-3 py-3 text-center text-[11px]" style={{ color: "var(--notion-text-3)" }}>
        設定は自動で保存されます
      </div>
    </aside>
  )
}

function Section({
  label,
  right,
  children,
}: {
  label: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-medium" style={{ color: "var(--notion-text-2)" }}>
          {label}
        </label>
        {right}
      </div>
      {children}
    </div>
  )
}

function NativeSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none text-[13px] rounded-md border px-2.5 py-1.5 pr-7 outline-none transition-shadow focus:shadow-[var(--notion-shadow-sm)] focus:border-[var(--notion-border-focus)]"
        style={{
          background: "var(--notion-input)",
          borderColor: "var(--notion-input-border)",
          color: "var(--notion-text)",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
        style={{ color: "var(--notion-text-3)" }}
      >
        <Icon name="chevron-down" size={13} />
      </span>
    </div>
  )
}

function ThemePill({
  theme,
  onToggle,
}: {
  theme: "light" | "dark"
  onToggle: () => void
}) {
  const handle = (target: "light" | "dark") => {
    if (target !== theme) onToggle()
  }
  return (
    <div
      role="group"
      aria-label="テーマ切替"
      className="relative inline-flex items-center p-0.5 rounded-full"
      style={{ background: "var(--notion-surface-1)" }}
    >
      <span
        aria-hidden
        className="absolute top-0.5 bottom-0.5 rounded-full transition-transform"
        style={{
          background: "var(--notion-bg)",
          boxShadow: "var(--notion-shadow-sm)",
          width: "calc(50% - 2px)",
          transform: theme === "light" ? "translateX(0)" : "translateX(100%)",
        }}
      />
      <button
        type="button"
        onClick={() => handle("light")}
        title="ライトモード"
        aria-pressed={theme === "light"}
        className="relative z-10 inline-flex items-center justify-center gap-1.5 px-3 h-7 rounded-full text-[12px] transition-colors"
        style={{
          color: theme === "light" ? "var(--notion-text)" : "var(--notion-text-3)",
          minWidth: 76,
        }}
      >
        <Icon name="sun" size={13} />
        ライト
      </button>
      <button
        type="button"
        onClick={() => handle("dark")}
        title="ダークモード"
        aria-pressed={theme === "dark"}
        className="relative z-10 inline-flex items-center justify-center gap-1.5 px-3 h-7 rounded-full text-[12px] transition-colors"
        style={{
          color: theme === "dark" ? "var(--notion-text)" : "var(--notion-text-3)",
          minWidth: 76,
        }}
      >
        <Icon name="moon" size={13} />
        ダーク
      </button>
    </div>
  )
}
