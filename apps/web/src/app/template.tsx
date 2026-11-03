"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Soft page-enter fade on every route change. Opacity only: a transform or filter here
 * would create a containing block and break `position: fixed` (GSAP pinning, modals).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
