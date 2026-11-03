import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { generateText, Output, type LanguageModel } from "ai";
import type { z } from "zod";
import {
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  resolveModelId,
  resolveProvider,
  truncatePrompt,
  type AIProvider,
} from "./config";

export interface GenerateOptions {
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}


export async function generateStructured<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>,
  options: GenerateOptions = {},
): Promise<{ data: T; provider: AIProvider; model: string }> {
  const provider = options.provider ?? resolveProvider();
  if (!provider) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  const model = resolveModelId(provider, options.model);
  const languageModel = getLanguageModelInternal(provider, model);

  try {
    const result = await generateText({
      model: languageModel,
      system: systemPrompt,
      prompt: truncatePrompt(userPrompt) + "\n\nRespond with valid JSON only. No markdown.",
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
      maxOutputTokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
      output: Output.object({ schema }),
    });

    return { data: result.output, provider, model };
  } catch (error) {
    if (error instanceof Error && error.message.includes("AI_NOT_CONFIGURED")) {
      throw error;
    }
    throw new Error(
      `AI generation failed (${provider}/${model}): ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export { resolveProvider, resolveModelId, isAiConfigured } from "./config";

export function getLanguageModel(options: GenerateOptions = {}): {
  model: LanguageModel;
  provider: AIProvider;
  modelId: string;
} {
  const provider = options.provider ?? resolveProvider();
  if (!provider) {
    throw new Error("AI_NOT_CONFIGURED");
  }
  const modelId = resolveModelId(provider, options.model);
  return { model: getLanguageModelInternal(provider, modelId), provider, modelId };
}

function getLanguageModelInternal(provider: AIProvider, modelId: string): LanguageModel {
  switch (provider) {
    case "openai":
      return openai(modelId);
    case "anthropic":
      return anthropic(modelId);
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}
