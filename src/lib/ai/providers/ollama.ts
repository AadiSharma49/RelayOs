import { AIProvider, type ProviderHealth, type ExtractionResult } from "./provider"

export class OllamaProvider implements AIProvider {
  readonly name = "ollama" as const
  readonly model = "llama3.2:latest"

  async extractConversation(): Promise<ExtractionResult> {
    throw new Error("Ollama provider not yet implemented")
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

export function createOllamaProvider(): AIProvider {
  return new OllamaProvider()
}