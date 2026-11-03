# Third-party UI code

Parts of the web app's UI are built on, or vendored from, these open-source projects:

| Project | What we use | Where | License |
|---|---|---|---|
| [Vanta.js](https://github.com/tengbao/vanta) | `NET` animated background (npm dependency, with three.js r134) | `src/components/motion/VantaNet.tsx` | MIT |
| [Bklit UI](https://github.com/bklit/bklit-ui) | Sparkline charts, installed from the `@bklit` shadcn registry | `src/components/charts/` | MIT (chart components) |
| [Kokonut UI](https://github.com/kokonut-labs/kokonutui) | Split Flap Text, installed from the `@kokonutui` shadcn registry | `src/components/kokonutui/` | MIT |
| [Lenis](https://github.com/darkroomengineering/lenis) | Smooth scrolling (npm dependency) | `src/components/motion/SmoothScroll.tsx` | MIT |
| [GSAP](https://gsap.com) | ScrollTrigger animations (npm dependency) | `src/components/motion/` | GSAP standard license (free) |

Some motion components (`ScrambleText`, the tilt in `SpotlightCard`, `Terminal`) are our own
implementations of ideas popularised by [React Bits](https://reactbits.dev) and
[Magic UI](https://magicui.design). No React Bits source is included: its MIT + Commons Clause
license isn't compatible with this project's plain MIT license.

To update vendored registry components: `npx shadcn@latest add @bklit/<name>` or `@kokonutui/<name>`
from `apps/web` (registries are configured in `components.json`).
