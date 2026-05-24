export type LLMID =
  | OpenAILLMID

// OpenAI Models (UPDATED 5/18/26)
export type OpenAILLMID =
  | "gpt-5.5" // GPT-5.5
  | "gpt-5.5-pro" // GPT-5.5 pro
  | "gpt-5.4-mini" // GPT-5.5 mini
  | "gpt-5.4-nano" // GPT-5.4 nano
  | "gpt-5.4" // GPT-5.4
  | "gpt-image-1" // GPT Image 1
  | "gpt-image-2" // GPT Image 2

export interface LLM {
    modelId: OpenAILLMID
    modelName: string
    // provider: ModelProvider プロバイダーを増やす場合に実装
    hostedId: string
    platformLink: string
    imageInput: boolean
    imageOutput?: boolean
    pricing?: {
        currency: string
        unit: string
        inputCost: number
        outputCost?: number
    }
}