/**
 * AnimatedModal (Aceternity UI) — reimplementação padronizada shadcn.
 *
 * Modal com animação de entrada (scale + rotateX + translateY), overlay
 * com backdrop-blur, click-outside para fechar e lock do body scroll
 * enquanto aberto. Split em 2 arquivos pra satisfazer o eslint
 * `react-refresh/only-export-components`:
 *   - `animated-modal.tsx`        → 5 componentes (este arquivo)
 *   - `animated-modal-hooks.ts`   → 2 hooks (useAnimatedModal + useAnimatedModalOutsideClick)
 *
 * API:
 *   <AnimatedModalProvider>
 *     <AnimatedModalTrigger>...</AnimatedModalTrigger>
 *     <AnimatedModalBody>
 *       <AnimatedModalContent>...</AnimatedModalContent>
 *       <AnimatedModalFooter>...</AnimatedModalFooter>
 *     </AnimatedModalBody>
 *   </AnimatedModalProvider>
 *
 * data-slot:
 *  - animated-modal        → wrapper do Provider (dono do estado open)
 *  - animated-modal-body   → motion.div interno que recebe scale/rotateX/translateY
 */

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"
import {
  AnimatedModalContext,
  useAnimatedModal,
  useAnimatedModalOutsideClick,
} from "./animated-modal-hooks"

interface AnimatedModalProviderProps {
  children: React.ReactNode
}

function AnimatedModalProvider({ children }: AnimatedModalProviderProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <AnimatedModalContext.Provider value={{ open, setOpen }}>
      <div data-slot="animated-modal">{children}</div>
    </AnimatedModalContext.Provider>
  )
}

interface AnimatedModalTriggerProps {
  children: React.ReactNode
  className?: string
}

function AnimatedModalTrigger({
  children,
  className,
}: AnimatedModalTriggerProps) {
  const { setOpen } = useAnimatedModal()
  return (
    <button
      type="button"
      className={cn(
        "px-4 py-2 rounded-md text-black dark:text-white text-center relative overflow-hidden",
        className,
      )}
      onClick={() => setOpen(true)}
    >
      {children}
    </button>
  )
}

interface AnimatedModalBodyProps {
  children: React.ReactNode
  className?: string
}

function AnimatedModalBody({
  children,
  className,
}: AnimatedModalBodyProps) {
  const { open, setOpen } = useAnimatedModal()

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [open])

  const modalRef = React.useRef<HTMLDivElement | null>(null)
  useAnimatedModalOutsideClick(modalRef, () => setOpen(false))

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          className="fixed [perspective:800px] [transform-style:preserve-3d] inset-0 h-full w-full flex items-center justify-center z-50"
        >
          <AnimatedModalOverlay />

          <motion.div
            ref={modalRef}
            data-slot="animated-modal-body"
            className={cn(
              "min-h-[50%] max-h-[90%] md:max-w-[40%] bg-card border border-border text-card-foreground md:rounded-2xl relative z-50 flex flex-col flex-1 overflow-hidden",
              className,
            )}
            initial={{ opacity: 0, scale: 0.5, rotateX: 40, y: 40 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 15 }}
          >
            <AnimatedModalCloseIcon />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AnimatedModalOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      className="fixed inset-0 h-full w-full bg-black/50 dark:bg-black/70 z-50"
    />
  )
}

function AnimatedModalCloseIcon() {
  const { setOpen } = useAnimatedModal()
  return (
    <button
      type="button"
      onClick={() => setOpen(false)}
      aria-label="Fechar modal"
      className="absolute top-4 right-4 group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-black dark:text-white h-4 w-4 group-hover:scale-125 group-hover:rotate-3 transition duration-200"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M18 6l-12 12" />
        <path d="M6 6l12 12" />
      </svg>
    </button>
  )
}

interface AnimatedModalContentProps {
  children: React.ReactNode
  className?: string
}

function AnimatedModalContent({
  children,
  className,
}: AnimatedModalContentProps) {
  return (
    <div className={cn("flex flex-col flex-1 p-8 md:p-10", className)}>
      {children}
    </div>
  )
}

interface AnimatedModalFooterProps {
  children: React.ReactNode
  className?: string
}

function AnimatedModalFooter({
  children,
  className,
}: AnimatedModalFooterProps) {
  return (
    <div
      className={cn(
        "flex justify-end p-4 bg-muted text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  )
}

export {
  AnimatedModalProvider,
  AnimatedModalTrigger,
  AnimatedModalBody,
  AnimatedModalContent,
  AnimatedModalFooter,
}
