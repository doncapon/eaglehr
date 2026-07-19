"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface FadeInUpProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

/** Fades and slides content up into place on mount — used for hero copy, section intros, etc. */
export function FadeInUp({ delay = 0, transition, ...props }: FadeInUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT_EXPO, ...transition }}
      {...props}
    />
  );
}

const staggerContainerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

/**
 * Wrap a list of StaggerItem children to reveal them one after another on mount/update.
 * Uses `animate` (not `whileInView`) deliberately — this is used for data-driven lists
 * (job/company grids) that re-render in place after a client-side search/filter change,
 * where there's no actual scroll for an IntersectionObserver to react to.
 */
export function StaggerContainer(props: HTMLMotionProps<"div">) {
  return <motion.div initial="hidden" animate="show" variants={staggerContainerVariants} {...props} />;
}

export function StaggerItem(props: HTMLMotionProps<"div">) {
  return <motion.div variants={staggerItemVariants} {...props} />;
}
