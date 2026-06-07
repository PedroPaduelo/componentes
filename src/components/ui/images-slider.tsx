import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

export type ImagesSliderProps = {
  /** Lista de URLs das imagens exibidas no slider. */
  images: string[]
  /** Conteúdo sobreposto às imagens (centralizado). */
  children?: React.ReactNode
  /** Mostra (ou substitui) a camada de overlay escura. Default `true`. */
  overlay?: React.ReactNode
  /** Classe extra aplicada ao overlay padrão. */
  overlayClassName?: string
  /** Classe extra do container raiz. */
  className?: string
  /** Avança automaticamente a cada 5s. Default `true`. */
  autoplay?: boolean
  /** Direção da animação de saída do slide. Default `"up"`. */
  direction?: "up" | "down"
}

const slideVariants = {
  initial: {
    scale: 0,
    opacity: 0,
    rotateX: 45,
  },
  visible: {
    scale: 1,
    rotateX: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.645, 0.045, 0.355, 1.0] as const,
    },
  },
  upExit: {
    opacity: 1,
    y: "-150%",
    transition: {
      duration: 1,
    },
  },
  downExit: {
    opacity: 1,
    y: "150%",
    transition: {
      duration: 1,
    },
  },
}

function ImagesSlider({
  images,
  children,
  overlay = true,
  overlayClassName,
  className,
  autoplay = true,
  direction = "up",
}: ImagesSliderProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [loadedImages, setLoadedImages] = React.useState<string[]>([])

  const handleNext = React.useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 === images.length ? 0 : prevIndex + 1
    )
  }, [images.length])

  const handlePrevious = React.useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex - 1 < 0 ? images.length - 1 : prevIndex - 1
    )
  }, [images.length])

  React.useEffect(() => {
    let cancelled = false
    const loadPromises = images.map(
      (image) =>
        new Promise<string>((resolve, reject) => {
          const img = new Image()
          img.src = image
          img.onload = () => resolve(image)
          img.onerror = reject
        })
    )

    Promise.all(loadPromises)
      .then((loaded) => {
        if (!cancelled) setLoadedImages(loaded)
      })
      .catch(() => {
        if (!cancelled) setLoadedImages(images)
      })

    return () => {
      cancelled = true
    }
  }, [images])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNext()
      } else if (event.key === "ArrowLeft") {
        handlePrevious()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    let interval: ReturnType<typeof setInterval> | undefined
    if (autoplay) {
      interval = setInterval(() => {
        handleNext()
      }, 5000)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (interval) clearInterval(interval)
    }
  }, [autoplay, handleNext, handlePrevious])

  const areImagesLoaded = loadedImages.length > 0

  return (
    <div
      data-slot="images-slider"
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className
      )}
      style={{ perspective: "1000px" }}
    >
      {areImagesLoaded && children}
      {areImagesLoaded && overlay && (
        <div
          className={cn("absolute inset-0 z-40 bg-black/60", overlayClassName)}
        />
      )}

      {areImagesLoaded && (
        <AnimatePresence>
          <motion.img
            key={currentIndex}
            src={loadedImages[currentIndex]}
            initial="initial"
            animate="visible"
            exit={direction === "up" ? "upExit" : "downExit"}
            variants={slideVariants}
            className="absolute inset-0 h-full w-full object-cover object-center"
            alt=""
          />
        </AnimatePresence>
      )}
    </div>
  )
}

export { ImagesSlider }
