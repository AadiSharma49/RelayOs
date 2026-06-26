import { AIProvider, type ProviderHealth, type ProviderName, type ExtractionResult } from "./provider"
import { createGeminiProvider } from "./gemini"

export function getProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "openrouter") as ProviderName

  switch (provider) {
    case "gemini":
      return createGeminiProvider()
    case "openrouter":
      // Future: return createOpenRouterProvider()
      throw new Error("OpenRouter provider not yet migrated. Set AI_PROVIDER=gemini and configure GEMINI_API_KEY.")
    case "openai":
      throw new Error("OpenAI provider not yet implemented")
    case "anthropic":
      throw new Error("Anthropic provider not yet implemented")
    case "ollama":
      throw new Error("Ollama provider not yet implemented")
    default:
      throw new Error(`Unknown AI_PROVIDER: ${provider}`)
  }
}

export async function getProviderHealth(): Promise<ProviderHealth> {
  const provider = getProvider()
  return provider.healthCheck()
}