"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  mergeSpring,
  cornerDelay,
  type SelBlock,
} from "@/hooks/use-merge-split-internal";

// Renders the selected-background blocks produced by useMergeSplitBlocks — one
// per run, or two abutting halves mid merge/split. `dimmed` drops the opacity to
// 0.8 (when the user is hovering a non-selected row) to match the standalone
// hover indicator; a block's own `opacity` override (e.g. the commit ghost)
// always wins. Corners are driven numerically so merge/split can straighten and
// re-round individual corners.
export function SelectionBackgrounds({
  blocks,
  dimmed,
}: {
  blocks: SelBlock[];
  dimmed: boolean;
}) {
  return (
    <AnimatePresence>
      {blocks.map((b) => {
        const corner = b.delayCorners
          ? { ...mergeSpring, delay: b.cornerDelay ?? cornerDelay }
          : mergeSpring;
        const opacity = b.opacity ?? (dimmed ? 0.8 : 1);
        return (
          <motion.div
            key={b.key}
            aria-hidden
            className="absolute bg-active pointer-events-none"
            initial={
              b.enterFrom
                ? {
                    opacity,
                    top: b.enterFrom.top,
                    left: b.left,
                    width: b.width,
                    height: b.enterFrom.height,
                    borderTopLeftRadius: b.enterFrom.radii[0],
                    borderTopRightRadius: b.enterFrom.radii[1],
                    borderBottomRightRadius: b.enterFrom.radii[2],
                    borderBottomLeftRadius: b.enterFrom.radii[3],
                  }
                : false
            }
            animate={{
              top: b.top,
              left: b.left,
              width: b.width,
              height: b.height,
              borderTopLeftRadius: b.radii[0],
              borderTopRightRadius: b.radii[1],
              borderBottomRightRadius: b.radii[2],
              borderBottomLeftRadius: b.radii[3],
              opacity,
            }}
            exit={{ opacity: 0, transition: { duration: b.exitInstant ? 0 : 0.12 } }}
            transition={
              b.instant
                ? { duration: 0 }
                : {
                    ...mergeSpring,
                    borderTopLeftRadius: corner,
                    borderTopRightRadius: corner,
                    borderBottomRightRadius: corner,
                    borderBottomLeftRadius: corner,
                    opacity: { duration: 0.08 },
                  }
            }
          />
        );
      })}
    </AnimatePresence>
  );
}
