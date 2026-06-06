import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export type MeteorsProps = {
  /** Quantidade de meteoros renderizados. Padrão: 20. */
  number?: number
  /** Classes extras aplicadas a cada meteoro. */
  className?: string
}

function Meteors({ number = 20, className }: MeteorsProps) {
  const meteors = new Array(number).fill(true)
  return (
    <motion.div
      data-slot="meteors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {meteors.map((_, idx) => {
        const position = idx * (800 / number) - 400
        return (
          <span
            key={"meteor" + idx}
            className={cn(
              "animate-meteor-effect absolute h-0.5 w-0.5 rotate-[45deg] rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
              "before:absolute before:top-1/2 before:h-px before:w-[50px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-[#64748b] before:to-transparent before:content-['']",
              className
            )}
            style={{
              top: "-40px",
              left: position + "px",
              animationDelay: Math.random() * 5 + "s",
              animationDuration:
                Math.floor(Math.random() * (10 - 5) + 5) + "s",
            }}
          />
        )
      })}
    </motion.div>
  )
}

export { Meteors }
