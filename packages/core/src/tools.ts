import type { CoreEcosystem } from "./ecosystems";

export type ToolCategory = "agent" | "mcp" | "ai-sdk" | "framework" | "backend";

export interface ToolEntry {
  /** URL-safe id. */
  id: string;
  name: string;
  category: ToolCategory;
  ecosystem: CoreEcosystem;
  /** Package name as published to the registry (what OSV tracks). */
  packageName: string;
  description: string;
  homepage: string;
  /** CLI binary used to detect the installed version (`<bin> --version`). */
  bin?: string;
}

export const TOOL_CATEGORY_LABEL: Record<ToolCategory, string> = {
  agent: "AI coding agents",
  mcp: "MCP servers & SDKs",
  "ai-sdk": "AI SDKs & LLM libraries",
  framework: "App frameworks",
  backend: "Backend, auth & data",
};

/**
 * The tools vibecoders actually run. Each maps to a registry package so OSV can tell us when
 * a CVE or malicious release lands. Contributions welcome — keep entries to packages with a
 * real registry presence (see CONTRIBUTING.md → "Adding a tool to Tool Watch").
 */
export const TOOL_CATALOG: ToolEntry[] = [
  // AI coding agents
  { id: "claude-code", name: "Claude Code", category: "agent", ecosystem: "NPM", packageName: "@anthropic-ai/claude-code", bin: "claude", description: "Anthropic's agentic coding CLI.", homepage: "https://github.com/anthropics/claude-code" },
  { id: "codex-cli", name: "Codex CLI", category: "agent", ecosystem: "NPM", packageName: "@openai/codex", bin: "codex", description: "OpenAI's terminal coding agent.", homepage: "https://github.com/openai/codex" },
  { id: "gemini-cli", name: "Gemini CLI", category: "agent", ecosystem: "NPM", packageName: "@google/gemini-cli", bin: "gemini", description: "Google's open-source terminal agent.", homepage: "https://github.com/google-gemini/gemini-cli" },
  { id: "aider", name: "Aider", category: "agent", ecosystem: "PYPI", packageName: "aider-chat", bin: "aider", description: "AI pair programming in your terminal.", homepage: "https://aider.chat" },

  // MCP
  { id: "mcp-ts-sdk", name: "MCP TypeScript SDK", category: "mcp", ecosystem: "NPM", packageName: "@modelcontextprotocol/sdk", description: "Official SDK most JS MCP servers are built on.", homepage: "https://github.com/modelcontextprotocol/typescript-sdk" },
  { id: "mcp-py-sdk", name: "MCP Python SDK", category: "mcp", ecosystem: "PYPI", packageName: "mcp", description: "Official SDK most Python MCP servers are built on.", homepage: "https://github.com/modelcontextprotocol/python-sdk" },
  { id: "fastmcp", name: "FastMCP", category: "mcp", ecosystem: "PYPI", packageName: "fastmcp", description: "High-level Python framework for MCP servers.", homepage: "https://github.com/jlowin/fastmcp" },
  { id: "mcp-remote", name: "mcp-remote", category: "mcp", ecosystem: "NPM", packageName: "mcp-remote", description: "Bridges local MCP clients to remote servers (OAuth).", homepage: "https://github.com/geelen/mcp-remote" },
  { id: "mcp-inspector", name: "MCP Inspector", category: "mcp", ecosystem: "NPM", packageName: "@modelcontextprotocol/inspector", description: "Debugging UI for MCP servers.", homepage: "https://github.com/modelcontextprotocol/inspector" },
  { id: "playwright-mcp", name: "Playwright MCP", category: "mcp", ecosystem: "NPM", packageName: "@playwright/mcp", description: "Browser automation for agents.", homepage: "https://github.com/microsoft/playwright-mcp" },
  { id: "mcp-filesystem", name: "Filesystem MCP server", category: "mcp", ecosystem: "NPM", packageName: "@modelcontextprotocol/server-filesystem", description: "Reference server that gives agents file access.", homepage: "https://github.com/modelcontextprotocol/servers" },

  // AI SDKs
  { id: "vercel-ai", name: "Vercel AI SDK", category: "ai-sdk", ecosystem: "NPM", packageName: "ai", description: "TypeScript toolkit for LLM apps.", homepage: "https://ai-sdk.dev" },
  { id: "openai-node", name: "OpenAI Node SDK", category: "ai-sdk", ecosystem: "NPM", packageName: "openai", description: "Official OpenAI client for JS/TS.", homepage: "https://github.com/openai/openai-node" },
  { id: "anthropic-ts", name: "Anthropic TS SDK", category: "ai-sdk", ecosystem: "NPM", packageName: "@anthropic-ai/sdk", description: "Official Claude API client for JS/TS.", homepage: "https://github.com/anthropics/anthropic-sdk-typescript" },
  { id: "langchain-js", name: "LangChain.js", category: "ai-sdk", ecosystem: "NPM", packageName: "@langchain/core", description: "Core of the LangChain JS ecosystem.", homepage: "https://js.langchain.com" },
  { id: "langchain-py", name: "LangChain (Python)", category: "ai-sdk", ecosystem: "PYPI", packageName: "langchain", description: "LLM orchestration framework.", homepage: "https://python.langchain.com" },
  { id: "llama-index", name: "LlamaIndex", category: "ai-sdk", ecosystem: "PYPI", packageName: "llama-index", description: "RAG & data framework for LLMs.", homepage: "https://www.llamaindex.ai" },
  { id: "litellm", name: "LiteLLM", category: "ai-sdk", ecosystem: "PYPI", packageName: "litellm", description: "Proxy/SDK for 100+ LLM providers.", homepage: "https://github.com/BerriAI/litellm" },
  { id: "transformers", name: "Transformers", category: "ai-sdk", ecosystem: "PYPI", packageName: "transformers", description: "Hugging Face model library.", homepage: "https://github.com/huggingface/transformers" },

  // Frameworks
  { id: "nextjs", name: "Next.js", category: "framework", ecosystem: "NPM", packageName: "next", description: "The default stack for v0, Bolt and Lovable exports.", homepage: "https://nextjs.org" },
  { id: "react", name: "React DOM", category: "framework", ecosystem: "NPM", packageName: "react-dom", description: "React's renderer (incl. server components).", homepage: "https://react.dev" },
  { id: "vite", name: "Vite", category: "framework", ecosystem: "NPM", packageName: "vite", description: "Dev server behind most modern front ends.", homepage: "https://vite.dev" },
  { id: "astro", name: "Astro", category: "framework", ecosystem: "NPM", packageName: "astro", description: "Content-focused web framework.", homepage: "https://astro.build" },
  { id: "sveltekit", name: "SvelteKit", category: "framework", ecosystem: "NPM", packageName: "@sveltejs/kit", description: "Svelte's app framework.", homepage: "https://svelte.dev" },
  { id: "nuxt", name: "Nuxt", category: "framework", ecosystem: "NPM", packageName: "nuxt", description: "Vue's full-stack framework.", homepage: "https://nuxt.com" },
  { id: "express", name: "Express", category: "framework", ecosystem: "NPM", packageName: "express", description: "Minimal Node.js web server.", homepage: "https://expressjs.com" },
  { id: "fastapi", name: "FastAPI", category: "framework", ecosystem: "PYPI", packageName: "fastapi", description: "Python APIs, popular for AI backends.", homepage: "https://fastapi.tiangolo.com" },
  { id: "django", name: "Django", category: "framework", ecosystem: "PYPI", packageName: "django", description: "Batteries-included Python web framework.", homepage: "https://www.djangoproject.com" },
  { id: "flask", name: "Flask", category: "framework", ecosystem: "PYPI", packageName: "flask", description: "Lightweight Python web framework.", homepage: "https://flask.palletsprojects.com" },
  { id: "streamlit", name: "Streamlit", category: "framework", ecosystem: "PYPI", packageName: "streamlit", description: "Python data & AI apps.", homepage: "https://streamlit.io" },
  { id: "gradio", name: "Gradio", category: "framework", ecosystem: "PYPI", packageName: "gradio", description: "ML demo UIs in Python.", homepage: "https://www.gradio.app" },

  // Backend, auth & data
  { id: "supabase-js", name: "Supabase JS", category: "backend", ecosystem: "NPM", packageName: "@supabase/supabase-js", description: "Client for Lovable/Bolt's favourite backend.", homepage: "https://supabase.com" },
  { id: "firebase", name: "Firebase JS SDK", category: "backend", ecosystem: "NPM", packageName: "firebase", description: "Google's app backend SDK.", homepage: "https://firebase.google.com" },
  { id: "next-auth", name: "Auth.js (NextAuth)", category: "backend", ecosystem: "NPM", packageName: "next-auth", description: "Authentication for Next.js.", homepage: "https://authjs.dev" },
  { id: "clerk-nextjs", name: "Clerk for Next.js", category: "backend", ecosystem: "NPM", packageName: "@clerk/nextjs", description: "Hosted auth & user management.", homepage: "https://clerk.com" },
  { id: "better-auth", name: "Better Auth", category: "backend", ecosystem: "NPM", packageName: "better-auth", description: "Framework-agnostic TypeScript auth.", homepage: "https://www.better-auth.com" },
  { id: "prisma", name: "Prisma", category: "backend", ecosystem: "NPM", packageName: "prisma", description: "TypeScript ORM & migrations.", homepage: "https://www.prisma.io" },
  { id: "drizzle", name: "Drizzle ORM", category: "backend", ecosystem: "NPM", packageName: "drizzle-orm", description: "Lightweight TypeScript ORM.", homepage: "https://orm.drizzle.team" },
  { id: "axios", name: "Axios", category: "backend", ecosystem: "NPM", packageName: "axios", description: "The HTTP client agents reach for first.", homepage: "https://axios-http.com" },
];

export function findTool(id: string): ToolEntry | undefined {
  return TOOL_CATALOG.find((t) => t.id === id);
}
