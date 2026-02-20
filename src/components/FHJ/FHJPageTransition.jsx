// ==========================================================
// 📄 FILE: FHJPageTransition.jsx  (PHASE 3 — LUXURY POLISH)
// Smooth animated transitions between pages
// Location: src/components/FHJ/FHJPageTransition.jsx
//
// Usage in AppShell.jsx:
//   import FHJPageTransition from "./components/FHJ/FHJPageTransition.jsx";
//
//   <main>
//     <FHJPageTransition>
//       <Outlet />
//     </FHJPageTransition>
//   </main>
//
// Or wrap individual pages:
//   <FHJPageTransition variant="slide-up">
//     <BookingIntake />
//   </FHJPageTransition>
// ==========================================================

import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

// -------------------------------------------------------
// Transition Presets
// -------------------------------------------------------
const TRANSITIONS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.35, ease: "easeInOut" },
  },

  "slide-up": {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
  },

  "slide-right": {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 40 },
    transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
  },

  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] },
  },

  luxury: {
    initial: { opacity: 0, y: 20, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -10, filter: "blur(4px)" },
    transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] },
  },
};

// -------------------------------------------------------
// Component
// -------------------------------------------------------
export default function FHJPageTransition({
  children,
  variant = "luxury",
  className = "",
  style = {},
}) {
  const location = useLocation();
  const preset = TRANSITIONS[variant] || TRANSITIONS.luxury;

  return (
    <motion.div
      key={location.pathname}
      initial={preset.initial}
      animate={preset.animate}
      exit={preset.exit}
      transition={preset.transition}
      className={className}
      style={{
        width: "100%",
        minHeight: "100%",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// Export presets for custom usage
export { TRANSITIONS };
