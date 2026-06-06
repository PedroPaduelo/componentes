import * as React from "react"

/** A single selectable entry inside a `Notch` group. */
export type NotchOption = {
  /** Stable identifier passed back in callbacks. */
  id: string
  /** What renders for this option. Can be text or any node. */
  label: React.ReactNode
  /** Optional leading node (icon, swatch, etc.) shown before the label. */
  icon?: React.ReactNode
}

/** A group of options revealed when its trigger is pressed. */
export type NotchItem = {
  /** Stable identifier for the group. */
  id: string
  /** Trigger label shown in the bar. */
  label: React.ReactNode
  /** Optional leading icon for the trigger. */
  icon?: React.ReactNode
  /** The choices revealed when the group is opened. */
  options: NotchOption[]
  /** Uncontrolled initial selected option id. */
  defaultValue?: string
  /** Controlled selected option id. */
  value?: string
  /** Show the selected value next to the trigger label. Overrides `showSelectedValue`. */
  showValue?: boolean
  /** Fires with the selected option whenever it changes. */
  onChange?: (optionId: string, option: NotchOption) => void
}

export interface NotchProps {
  /** The groups shown inside the notch. Pass one or many. */
  items: NotchItem[]
  /** Pin the notch to the top or bottom of the viewport. */
  position?: "top" | "bottom"
  /** Horizontal alignment of the floating notch. */
  align?: "start" | "center" | "end"
  /** Fired for any group change, in addition to the per-item callback. */
  onItemChange?: (
    itemId: string,
    optionId: string,
    option: NotchOption,
  ) => void
  /** Close the panel after selecting an option. */
  closeOnSelect?: boolean
  /** Show each group's selected value next to its trigger label. */
  showSelectedValue?: boolean
  /** Render dotted dividers between groups. */
  showDividers?: boolean
  /** Highlight color for the selected option. Any CSS color or variable. */
  accentColor?: string
  /** Distance from the pinned edge, in pixels. */
  offset?: number
  /** Play the entrance animation on mount. */
  reveal?: boolean
  /** Classes applied to the floating shell. */
  className?: string
  /** Classes applied to every trigger. */
  itemClassName?: string
  /** Classes applied to the options panel. */
  panelClassName?: string
}
