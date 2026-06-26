export type ProviderName = "gemini" | "openrouter" | "openai" | "anthropic" | "ollama"

export interface ProviderHealth {
  connected: boolean
  provider: ProviderName
  model: string
  lastCheck: string
  available: boolean
  error?: string
}

export interface ExtractionResult {
  decisions: Array<{
    title: string
    summary: string
    status: "pending" | "accepted" | "rejected" | "deferred"
    confidence: number
  }>
  actionItems: Array<{
    title: string
    description: string
    priority: "low" | "medium" | "high"
  }>
  questions: Array<{
    question: string
  }>
}

export interface AIProvider {
  readonly name: ProviderName
  readonly model: string

  extractConversation(content: string): Promise<ExtractionResult>
  healthCheck(): Promise<ProviderHealth>
}