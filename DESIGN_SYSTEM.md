
# Design System

## Design Personality

StackRadar should feel:

- precise,
- editorial,
- technical,
- composed,
- trustworthy,
- quietly premium.

## Avoid

- emoji-heavy UI
- fake AI glow
- purple gradients
- hacker skulls
- red-alert panic screens
- cluttered enterprise dashboards
- childish illustrations

## Color Tokens

```ts
export const colors = {
  background: {
    dark: "#080A0D",
    light: "#F7F7F4"
  },
  surface: {
    dark: "#101419",
    darkElevated: "#151B22",
    light: "#FFFFFF"
  },
  border: {
    dark: "#26303A",
    light: "#D9DED8"
  },
  text: {
    primaryDark: "#F4F5F2",
    secondaryDark: "#A8B0B8",
    primaryLight: "#151819",
    secondaryLight: "#5C646B"
  },
  severity: {
    critical: "#E5484D",
    high: "#F97316",
    medium: "#EAB308",
    low: "#3B82F6",
    info: "#6B7280",
    safe: "#22C55E"
  }
}
```

Typography

Use strong hierarchy.
Hero: 56-72px desktop, 40-48px tablet, 34-40px mobile
H1: 44-56px
H2: 32-40px
H3: 24-28px
Body: 16-18px
Small: 13-14px
Mono metadata: 12-14px

Component Style

Cards:

* rounded-2xl
* subtle border
* low shadow
* no heavy gradients
* clear spacing
* hover states must feel restrained

Buttons:

* primary: high contrast
* secondary: outlined
* tertiary: ghost
* destructive only for admin/delete actions

Badges:

* compact
* readable
* consistent severity mapping

Forms:

* simple
* accessible labels
* strong focus states
* clear validation messages
