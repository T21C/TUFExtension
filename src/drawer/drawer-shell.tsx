import { motion } from "motion/react";
import type { PropsWithChildren } from "react";

interface DrawerShellProps extends PropsWithChildren {
  isOpen: boolean;
}

const DRAWER_MOTION = {
  closed: { x: "calc(100% + 24px)" },
  open: { x: 0 },
} as const;

const DRAWER_TRANSITION = {
  bounce: 0.18,
  damping: 30,
  mass: 0.72,
  stiffness: 620,
  type: "spring",
} as const;

export function DrawerShell({ children, isOpen }: DrawerShellProps) {
  return (
    <motion.aside
      animate={isOpen ? "open" : "closed"}
      aria-hidden={!isOpen}
      className="relative h-full w-full overflow-hidden rounded-lg bg-[#090909] font-sans text-white shadow-[0_0_40px_rgba(47,5,101,0.72)]"
      initial="closed"
      transition={DRAWER_TRANSITION}
      variants={DRAWER_MOTION}
    >
      {children}
    </motion.aside>
  );
}
