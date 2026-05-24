import { LLM } from "@/types"

const OPENAI_PLATORM_LINK = "https://platform.openai.com/docs/overview"

// OpenAI Models (UPDATED 1/25/24) -----------------------------
const GPT5_5: LLM = {
  modelId: "gpt-5.5",
  modelName: "GPT-5.5",
  hostedId: "gpt-5.5",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  // pricing: {
  //   currency: "USD",
  //   unit: "1M tokens",
  //   inputCost: 5,
  //   outputCost: 15
  // }
}

// GPT-5.5 pro
const GPT5_5_PRO: LLM = {
  modelId: "gpt-5.5-pro",
  modelName: "GPT-5.5-pro",
  hostedId: "gpt-5.5-pro",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  // pricing: {
  //   currency: "USD",
  //   unit: "1M tokens",
  //   inputCost: 0.15,
  //   outputCost: 0.6
  // }
}

// GPT-5.5 mini
const GPT5_4_MINI: LLM = {
  modelId: "gpt-5.4-mini",
  modelName: "GPT-5.4-mini",
  hostedId: "gpt-5.4-mini",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  // pricing: {
  //   currency: "USD",
  //   unit: "1M tokens",
  //   inputCost: 10,
  //   outputCost: 30
  // }
}

// GPT-5.5 nano
const GPT5_4_NANO: LLM = {
  modelId: "gpt-5.4-nano",
  modelName: "GPT-5.4-nano",
  hostedId: "gpt-5.4-nano",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  // pricing: {
  //   currency: "USD",
  //   unit: "1M tokens",
  //   inputCost: 10,
  //   outputCost: 30
  // }
}

// GPT-5.4
const GPT5_4: LLM = {
  modelId: "gpt-5.4",
  modelName: "GPT-5.4",
  hostedId: "gpt-5.4",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: true,
  // pricing: {
  //   currency: "USD",
  //   unit: "1M tokens",
  //   inputCost: 30,
  //   outputCost: 60
  // }
}

// GPT Image 2
const GPT_IMAGE_2: LLM = {
  modelId: "gpt-image-2",
  modelName: "GPT Image 2",
  hostedId: "gpt-image-2",
  platformLink: OPENAI_PLATORM_LINK,
  imageInput: false,
  imageOutput: true,
}

export const OPENAI_LLM_LIST: LLM[] = [
  GPT5_5,
  GPT5_5_PRO,
  GPT5_4_MINI,
  GPT5_4_NANO,
  GPT5_4,
  GPT_IMAGE_2
]