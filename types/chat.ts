import { LLMID } from "."

export type ImageSize = "auto" | "1024x1024" | "1024x1536" | "1536x1024"

export interface ChatSettings {
    model: LLMID                        // 現在のチャットで使うモデル（ヘッダのピッカー = 一時上書き）
    defaultModel: LLMID                 // 新規チャット作成時のデフォルト
    systemPrompt: string
    temperature: number                 // 0 – 2
    maxOutputTokens: number | null      // null = 無制限
    imageSize: ImageSize
    maxUploadSizeMB: number             // ファイルアップロード上限 (MB)
}

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
    model: "gpt-5.5",
    defaultModel: "gpt-5.5",
    systemPrompt: "",
    temperature: 1,
    maxOutputTokens: null,
    imageSize: "auto",
    maxUploadSizeMB: 10,
}