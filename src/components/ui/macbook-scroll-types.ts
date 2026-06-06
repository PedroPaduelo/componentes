export type MacbookScrollProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** Image source revealed inside the MacBook screen. */
  src?: string
  /** Show a gradient fade at the bottom of the keyboard area. */
  showGradient?: boolean
  /** Title text or React node displayed above the MacBook. */
  title?: string | React.ReactNode
  /** Optional badge rendered at the bottom-left of the keyboard. */
  badge?: React.ReactNode
  /** Ref to the scroll container. Pass this when using useScroll with a custom scrollable area. */
  scrollRef?: React.RefObject<HTMLDivElement | null>
}
