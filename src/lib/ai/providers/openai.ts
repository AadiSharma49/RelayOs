import { AIProvider, type ProviderHealth, type ExtractionResult } from "./provider"

export class OpenAIProvider implements AIProvider {
  readonly name = "openai" as const
  readonly model = "gpt-4o-mini"

  async extractConversation(): Promise<ExtractionResult> {
    throw new Error("OpenAI provider not yet implemented")
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      connected: false,
      provider: this.name,
      model: this.model,
      lastCheck: new Date().toISOString(),
      available: false,
      error: "Not implemented",
    }
  }
}

export function createOpenAIProvider(): AIProvider {
  return new OpenAIProvider()
}