import * as React from "react"
import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  MouseEnterContext,
  useMouseEnter,
} from "@/components/ui/3d-card-context"
import type {
  CardContainerProps,
  CardBodyProps,
  CardItemProps,
} from "@/components/ui/3d-card-types"

/**
 * 3D Card Effect (Aceternity UI) — reimplementação padronizada shadcn.
 *
 * O CardContainer inclina o cartão seguindo o cursor (rotateX/rotateY via CSS
 * transform direto, sem framer-motion); os CardItem flutuam em profundidades
 * distintas (translateZ) no hover. Sem dependência nova.
 *
 * data-slot:
 *  - card-container → wrapper externo (perspective)
 *  - card-tilt      → div interno que recebe o transform 3D (segue o cursor)
 *  - card-body      → área 96x96 que mantém transform-style preserve-3d
 *  - card-item      → cada elemento flutuante
 */

function CardContainer({
  children,
  className,
  containerClassName,
}: CardContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMouseEntered, setIsMouseEntered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect()
    const x = (e.clientX - left - width / 2) / 25
    const y = (e.clientY - top - height / 2) / 25
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`
  }

  const handleMouseEnter = () => setIsMouseEntered(true)

  const handleMouseLeave = () => {
    if (!containerRef.current) return
    setIsMouseEntered(false)
    containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`
  }

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        data-slot="card-container"
        className={cn("flex items-center justify-center", containerClassName)}
        style={{ perspective: "1000px" }}
      >
        <div
          ref={containerRef}
          data-slot="card-tilt"
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "relative flex items-center justify-center transition-all duration-200 ease-linear",
            className,
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  )
}

function CardBody({ children, className }: CardBodyProps) {
  return (
    <div
      data-slot="card-body"
      className={cn(
        "h-96 w-96 [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]",
        className,
      )}
    >
      {children}
    </div>
  )
}

function CardItem({
  as,
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: CardItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isMouseEntered] = useMouseEnter()

  React.useEffect(() => {
    if (!ref.current) return
    if (isMouseEntered) {
      ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
    } else {
      ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`
    }
  }, [
    isMouseEntered,
    translateX,
    translateY,
    translateZ,
    rotateX,
    rotateY,
    rotateZ,
  ])

  const Tag = as ?? "div"

  return React.createElement(
    Tag,
    {
      ref,
      "data-slot": "card-item",
      className: cn("w-fit transition duration-200 ease-linear", className),
      ...rest,
    } as React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLDivElement>; "data-slot"?: string },
    children,
  )
}

export { CardContainer, CardBody, CardItem }
