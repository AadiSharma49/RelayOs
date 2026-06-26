import { AIProvider, type ProviderHealth, type ExtractionResult } from "./provider"

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic" as const
  readonly model = "claude-3-5-haiku-20241022"

  async extractConversation(): Promise<ExtractionResult> {
    throw new Error("Anthropic provider not yet implemented")
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

export function createAnthropicProvider(): AIProvider {
  return new AnthropicProvider()
}