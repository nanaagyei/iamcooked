import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        "background-dark": "#0C0E11",
        "background-light": "#F4F3F0",
        surface: {
          dark: "#12151A",
          "dark-elevated": "#181C22",
          light: "#FFFFFF",
        },
        "border-dark": "#252A32",
        "border-light": "#DDDCD8",
        text: {
          "primary-dark": "#ECEEE9",
          "secondary-dark": "#8B929A",
          "primary-light": "#141618",
          "secondary-light": "#5C646B",
        },
        severity: {
          critical: "#E5484D",
          high: "#F97316",
          medium: "#EAB308",
          low: "#6B8AFD",
          info: "#6B7280",
          safe: "#9ECB3D",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
