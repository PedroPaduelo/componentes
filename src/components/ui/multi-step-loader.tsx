import * as React from "react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"
import { Check, Loader2 } from "lucide-react"

export type LoadingState = {
  text: string
}

export type MultiStepLoaderProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Lista de etapas exibidas no loader. */
  loadingStates: LoadingState[]
  /** Controla se o loader está visível. */
  loading?: boolean
  /** Duração em ms de cada etapa. Padrão: 2000. */
  duration?: number
  /** Se true, reinicia do início ao chegar na última etapa. Padrão: true. */
  loop?: boolean
}

const CheckIcon = ({ className }: { className?: string }) => (
  <Check className={cn("w-5 h-5", className)} />
)

const CheckFilled = ({ className }: { className?: string }) => (
  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center bg-lime-500", className)}>
    <Check className="w-3.5 h-3.5 text-black" />
  </div>
)

const LoaderCore = ({
  loadingStates,
  value = 0,
}: {
  loadingStates: LoadingState[]
  value?: number
}) => {
  return (
    <div className="flex relative justify-start max-w-xl mx-auto flex-col mt-40">
      {loadingStates.map((loadingState, index) => {
        const distance = Math.abs(index - value)
        const opacity = Math.max(1 - distance * 0.2, 0)

        return (
          <motion.div
            key={index}
            className="text-left flex gap-3 mb-4 items-center"
            initial={{ opacity: 0, y: -(value * 40) }}
            animate={{ opacity: opacity, y: -(value * 40) }}
            transition={{ duration: 0.5 }}
          >
            <div className="shrink-0">
              {index > value && (
                <CheckIcon className="text-muted-foreground" />
              )}
              {index <= value && (
                <CheckFilled
                  className={cn(
                    value === index && "ring-2 ring-lime-500/50"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "text-base",
                value === index
                  ? "text-lime-500 font-medium"
                  : "text-muted-foreground"
              )}
            >
              {loadingState.text}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}

export function MultiStepLoader({
  loadingStates,
  loading = false,
  duration = 2000,
  loop = true,
  className,
  ...props
}: MultiStepLoaderProps) {
  const [currentState, setCurrentState] = React.useState(0)

  React.useEffect(() => {
    if (!loading) {
      setCurrentState(0)
      return
    }
    const timeout = setTimeout(() => {
      setCurrentState((prevState) =>
        loop
          ? prevState === loadingStates.length - 1
            ? 0
            : prevState + 1
          : Math.min(prevState + 1, loadingStates.length - 1)
      )
    }, duration)

    return () => clearTimeout(timeout)
  }, [currentState, loading, loop, loadingStates.length, duration])

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="multi-step-loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl",
            className
          )}
          data-slot="multi-step-loader"
          {...props}
        >
          <div className="h-96 relative">
            <LoaderCore value={currentState} loadingStates={loadingStates} />
          </div>

          <div className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-white dark:bg-black h-full absolute [mask-image:radial-gradient(900px_at_center,transparent_30%,white)]" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
