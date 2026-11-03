export type AIProvider = "openai" | "anthropic";

const PLACEHOLDER_KEYS = new Set(["sk-placeholder", "sk-ant-placeholder"]);

export function isAiConfigured(): boolean {
  return resolveProvider() !== null;
}

export function resolveProvider(): AIProvider | null {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && !PLACEHOLDER_KEYS.has(openaiKey)) {
    return "openai";
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey && !PLACEHOLDER_KEYS.has(anthropicKey)) {
    return "anthropic";
  }

  return null;
}

export function resolveModelId(provider: AIProvider, override?: string): string {
  if (override) return override;

  switch (provider) {
    case "openai":
      return "gpt-4o-mini";
    case "anthropic":
      return "claude-3-5-sonnet-latest";
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}

export const MAX_USER_PROMPT_CHARS = 50_000;
export const DEFAULT_MAX_TOKENS = 4096;
export const DEFAULT_TEMPERATURE = 0.3;

export function truncatePrompt(text: string, max = MAX_USER_PROMPT_CHARS): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "\n\n[truncated]";
}
