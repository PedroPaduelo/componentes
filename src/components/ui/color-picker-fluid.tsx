"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/springs";
import { fontWeights } from "@/lib/font-weight";
import { useShape } from "@/lib/shape-context";
import { useSurface, SurfaceProvider } from "@/lib/surface-context";
import { surfaceClasses } from "@/lib/surface-classes";
import { useIcon } from "@/lib/icon-context";
import {
  type ColorFormat,
  type ParsedColor,
  clamp01,
  hsvToRgb,
  rgbToHsv,
  rgbToHsl,
  hslToRgb,
  rgbToOklch,
  oklchToRgb,
  rgbToHexStr,
  parseColor,
  buildParsed,
  formatValueByFormat,
} from "@/components/ui/color-picker-fluid-utils";
import { SliderFluid } from "@/components/ui/slider-fluid";
import { DropdownFluid } from "@/components/ui/dropdown-fluid";
import { useDropdownFluid } from "@/components/ui/dropdown-fluid-context";
import { TooltipFluid } from "@/components/ui/tooltip-fluid";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------


// Allows consumers (e.g. the /demo carousel) to portal popups inside a
// CSS-scaled ancestor so menu/popover layers visually scale with the picker.
const ColorPickerFluidPortalContainerContext = createContext<HTMLElement | null>(null);

function ColorPickerFluidPortalContainer({
  value,
  children,
}: {
  value: HTMLElement | null;
  children: ReactNode;
}) {
  return (
    <ColorPickerFluidPortalContainerContext.Provider value={value}>
      {children}
    </ColorPickerFluidPortalContainerContext.Provider>
  );
}


interface ColorPickerFluidProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, parsed: ParsedColor) => void;
  format?: ColorFormat;
  defaultFormat?: ColorFormat;
  onFormatChange?: (format: ColorFormat) => void;
  swatches?: string[];
  hideEyedropper?: boolean;
  /** Controls the format dropdown's open state. When provided, the dropdown
   *  is fully controlled and ignores user toggles. */
  formatOpen?: boolean;
  /** Initial open state for the format dropdown (uncontrolled). */
  defaultFormatOpen?: boolean;
}

interface ColorPickerFluidPopoverProps extends ColorPickerFluidProps {
  triggerLabel?: string;
  triggerLabelPosition?: "left" | "right";
  triggerShowValue?: boolean;
  triggerShowRemove?: boolean;
  onTriggerRemove?: () => void;
  triggerClassName?: string;
  /** Controls the popover's open state. When provided, the popover is fully
   *  controlled and ignores trigger clicks. */
  open?: boolean;
  /** Initial open state for the popover (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the open state would change (fires even when controlled). */
  onOpenChange?: (open: boolean) => void;
}

interface ColorSwatchFluidProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, "color"> {
  color: string;
  size?: number;
  selected?: boolean;
}

// ---------------------------------------------------------------------------
// Color math (no deps)
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PANEL_WIDTH = 280;
const SQUARE_HEIGHT = 156;
const CHECKER_BG: CSSProperties = {
  backgroundImage:
    "conic-gradient(var(--checker-a) 0 25%, var(--checker-b) 0 50%, var(--checker-a) 0 75%, var(--checker-b) 0)",
  backgroundSize: "8px 8px",
};

// ---------------------------------------------------------------------------
// SaturationSquare
// ---------------------------------------------------------------------------

interface SaturationSquareProps {
  h: number;
  s: number;
  v: number;
  onChange: (s: number, v: number) => void;
}

function SaturationSquare({ h, s, v, onChange }: SaturationSquareProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const hasMoved = useRef(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const shape = useShape();

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clamp01((clientX - rect.left) / rect.width);
      const y = clamp01((clientY - rect.top) / rect.height);
      onChange(x, 1 - y);
    },
    [onChange]
  );

  const updateCursorPos = useCallback((clientX: number, clientY: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setCursorPos({
      x: clamp01((clientX - rect.left) / rect.width) * 100,
      y: clamp01((clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      dragging.current = true;
      hasMoved.current = false;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      updateFromPointer(e.clientX, e.clientY);
    },
    [updateFromPointer]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      updateCursorPos(e.clientX, e.clientY);
      if (!dragging.current) return;
      hasMoved.current = true;
      updateFromPointer(e.clientX, e.clientY);
    },
    [updateFromPointer, updateCursorPos]
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    hasMoved.current = false;
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 0.1 : 0.01;
      let nextS = s, nextV = v, handled = true;
      if (e.key === "ArrowLeft") nextS = clamp01(s - step);
      else if (e.key === "ArrowRight") nextS = clamp01(s + step);
      else if (e.key === "ArrowUp") nextV = clamp01(v + step);
      else if (e.key === "ArrowDown") nextV = clamp01(v - step);
      else handled = false;
      if (handled) {
        e.preventDefault();
        onChange(nextS, nextV);
      }
    },
    [onChange, s, v]
  );

  const { r, g, b } = hsvToRgb(h, s, v);
  const thumbColor = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

  return (
    <div
      ref={ref}
      role="application"
      aria-label="Saturation and brightness"
      tabIndex={0}
      onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) setFocused(true); }}
      onBlur={() => setFocused(false)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setCursorPos(null);
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        "relative w-full select-none touch-none cursor-none outline-none",
        shape.bg
      )}
      style={{
        height: SQUARE_HEIGHT,
        boxShadow: focused ? "0 0 0 2px #6B97FF" : undefined,
      }}
    >
      <div
        className={cn(
          "absolute inset-0 overflow-hidden",
          shape.bg === "rounded-[20px]" ? "rounded-2xl" : shape.bg
        )}
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h}, 100%, 50%))`,
        }}
      />
      <motion.div
        className="absolute pointer-events-none rounded-full"
        initial={false}
        animate={{
          left: `${s * 100}%`,
          top: `${(1 - v) * 100}%`,
          width: 18,
          height: 18,
        }}
        transition={{ duration: 0 }}
        style={{
          transform: "translate(-50%, -50%)",
          border: "1px solid white",
          boxShadow: "0 0 0 1px rgba(0,0,0,1)",
          backgroundColor: thumbColor,
        }}
      />
      {hovered && !dragging.current && cursorPos && (
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            left: `${cursorPos.x}%`,
            top: `${cursorPos.y}%`,
            width: 18,
            height: 18,
            transform: "translate(-50%, -50%)",
            border: "2px solid rgba(255, 255, 255, 0.55)",
            boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.2)",
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HueSlider
// ---------------------------------------------------------------------------

function HueSlider({ h, onChange }: { h: number; onChange: (h: number) => void }) {
  const hueColor = `hsl(${h}, 100%, 50%)`;
  return (
    <SliderFluid
      value={h}
      onChange={(v) => onChange(typeof v === "number" ? v : v[0])}
      min={0}
      max={360}
      step={1}
      showValue={false}
      hideFill
      thumbColor={hueColor}
      thumbBorderColor="rgba(255,255,255,0.9)"
      trackStyle={{
        background:
          "linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))",
        borderColor: "transparent",
      }}
      aria-label="Hue"
    />
  );
}

// ---------------------------------------------------------------------------
// AlphaSlider
// ---------------------------------------------------------------------------

function AlphaSlider({
  a,
  solidColor,
  solidR,
  solidG,
  solidB,
  onChange,
}: {
  a: number;
  solidColor: string;
  solidR: number;
  solidG: number;
  solidB: number;
  onChange: (a: number) => void;
}) {
  // Use color-aware transparent stop (same hue, alpha 0) so the gradient stays
  // chromatically consistent and reaches fully opaque at 100% with no edge gap.
  const transparentColor = `rgba(${solidR}, ${solidG}, ${solidB}, 0)`;
  return (
    <SliderFluid
      value={Math.round(a * 100)}
      onChange={(v) => onChange((typeof v === "number" ? v : v[0]) / 100)}
      min={0}
      max={100}
      step={1}
      showValue={false}
      hideFill
      thumbColor={solidColor}
      thumbBorderColor="rgba(255,255,255,0.9)"
      trackStyle={{
        backgroundImage: `linear-gradient(to right, ${transparentColor} 0%, ${solidColor} 98%), conic-gradient(var(--checker-a) 0 25%, var(--checker-b) 0 50%, var(--checker-a) 0 75%, var(--checker-b) 0)`,
        backgroundSize: "100% 100%, 8px 8px",
        borderWidth: 0,
      }}
      aria-label="Alpha"
    />
  );
}

// ---------------------------------------------------------------------------
// FormatDropdown (custom, lightweight)
// ---------------------------------------------------------------------------

const FORMAT_LABELS: Record<ColorFormat, string> = {
  hex: "HEX",
  rgb: "RGB",
  hsl: "HSL",
  oklch: "OKLCH",
};

function FormatItem({
  index,
  label,
  checked,
  onSelect,
}: {
  index: number;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { registerItem, activeIndex, checkedIndex } = useDropdownFluid();
  const shape = useShape();

  useEffect(() => {
    registerItem(index, ref.current);
    return () => registerItem(index, null);
  }, [index, registerItem]);

  const isActive = activeIndex === index;

  return (
    <div
      ref={ref}
      data-proximity-index={index}
      role="menuitemradio"
      aria-checked={checked}
      aria-label={label}
      tabIndex={index === (checkedIndex ?? 0) ? 0 : -1}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        `relative z-10 flex items-center px-3 py-2 text-[13px] cursor-pointer outline-none`,
        shape.item
      )}
    >
      <span className="inline-grid">
        <span
          className="col-start-1 row-start-1 invisible"
          style={{ fontVariationSettings: fontWeights.semibold }}
          aria-hidden="true"
        >
          {label}
        </span>
        <span
          className={cn(
            "col-start-1 row-start-1 transition-[color,font-variation-settings] duration-80",
            isActive || checked ? "text-foreground" : "text-muted-foreground"
          )}
          style={{
            fontVariationSettings: checked
              ? fontWeights.semibold
              : fontWeights.normal,
          }}
        >
          {label}
        </span>
      </span>
    </div>
  );
}

function FormatDropdown({
  value,
  onChange,
  open: openProp,
  defaultOpen = false,
}: {
  value: ColorFormat;
  onChange: (f: ColorFormat) => void;
  open?: boolean;
  defaultOpen?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      if (isControlled) return;
      setInternalOpen(next);
    },
    [isControlled]
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const shape = useShape();
  const portalContainer = useContext(ColorPickerFluidPortalContainerContext);
  const [pos, setPos] = useState<
    | { mode: "fixed"; top: number; left: number; width: number }
    | { mode: "absolute"; top: number; left: number; width: number }
    | null
  >(null);

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setPos(null);
      return;
    }
    const triggerRect = triggerRef.current.getBoundingClientRect();
    if (portalContainer) {
      const cRect = portalContainer.getBoundingClientRect();
      const cWidth = portalContainer.offsetWidth;
      const scale = cWidth > 0 ? cRect.width / cWidth : 1;
      // Convert viewport coords into the portal container's pre-scale frame so
      // an ancestor CSS scale visually scales the menu alongside the trigger.
      setPos({
        mode: "absolute",
        top: (triggerRect.bottom - cRect.top) / scale + 6,
        left: (triggerRect.left - cRect.left) / scale,
        width: triggerRect.width / scale,
      });
    } else {
      setPos({
        mode: "fixed",
        top: triggerRect.bottom + 6,
        left: triggerRect.left,
        width: triggerRect.width,
      });
    }
  }, [open, portalContainer]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        !panelRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  const formats = ["hex", "rgb", "hsl", "oklch"] as const;
  const checkedIdx = formats.indexOf(value);
  const ChevronDownIcon = useIcon("chevron-down");

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center justify-between gap-2 h-9 px-3 text-[13px] bg-transparent hover:bg-hover hover:text-foreground transition-colors duration-80 outline-none focus-visible:ring-1 focus-visible:ring-[#6B97FF] cursor-pointer",
          open ? "bg-active text-foreground" : "text-muted-foreground active:bg-active",
          shape.input
        )}
        style={{ fontVariationSettings: fontWeights.medium }}
      >
        <span>{FORMAT_LABELS[value]}</span>
        <ChevronDownIcon
          size={14}
          strokeWidth={1.5}
          className={cn(
            "text-muted-foreground transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>
      {open && pos && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: pos.mode,
            top: pos.top,
            left: pos.left,
            zIndex: 60,
          }}
        >
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            transition={springs.fast}
            style={{ transformOrigin: "top center", minWidth: pos.width }}
          >
            <DropdownFluid checkedIndex={checkedIdx} className="!w-auto min-w-full">
              {formats.map((fmt, i) => (
                <FormatItem
                  key={fmt}
                  index={i}
                  label={FORMAT_LABELS[fmt]}
                  checked={value === fmt}
                  onSelect={() => {
                    onChange(fmt);
                    setOpen(false);
                  }}
                />
              ))}
            </DropdownFluid>
          </motion.div>
        </div>,
        portalContainer ?? document.body
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// ColorInput (a single styled text input, used for hex)
// ---------------------------------------------------------------------------

interface ColorInputProps {
  value: string;
  onCommit: (next: string) => void;
  ariaLabel: string;
  width?: string;
  className?: string;
  inputClassName?: string;
  align?: "left" | "center" | "right";
  prefix?: ReactNode;
  inputMode?: "numeric" | "decimal" | "text";
  nudgeStep?: number;
  nudgeShiftStep?: number;
  hasPercent?: boolean;
  decimals?: number;
  scrubbable?: boolean;
  min?: number;
  max?: number;
  /** When true with min and max, wrap (modulo) instead of clamping. Used for angular values like hue. */
  wrap?: boolean;
}

const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  (
    {
      value,
      onCommit,
      ariaLabel,
      width,
      className,
      inputClassName,
      align = "left",
      prefix,
      inputMode = "text",
      nudgeStep,
      nudgeShiftStep,
      hasPercent = false,
      decimals,
      scrubbable = false,
      min,
      max,
      wrap = false,
    },
    ref
  ) => {
    const [draft, setDraft] = useState(value);
    const [editing, setEditing] = useState(false);
    const interactingRef = useRef(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const scrubRef = useRef<{
      startX: number;
      startValue: number;
      scrubbing: boolean;
      pointerId: number;
    } | null>(null);
    const shape = useShape();

    useEffect(() => {
      if (!interactingRef.current) setDraft(value);
    }, [value]);

    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref]
    );

    const formatNumber = (n: number) =>
      decimals != null ? n.toFixed(decimals) : String(Math.round(n));

    const commitNumber = (n: number) => {
      let bounded = n;
      if (wrap && min != null && max != null) {
        const range = max - min;
        bounded = ((bounded - min) % range + range) % range + min;
      } else {
        if (min != null) bounded = Math.max(min, bounded);
        if (max != null) bounded = Math.min(max, bounded);
      }
      const formatted = formatNumber(bounded);
      const withSuffix = hasPercent ? `${formatted}%` : formatted;
      setDraft(withSuffix);
      onCommit(withSuffix);
    };

    const nudge = (direction: 1 | -1, shift: boolean) => {
      const baseStep = shift ? (nudgeShiftStep ?? 10) : (nudgeStep ?? 1);
      const cur = parseFloat(draft.replace("%", ""));
      if (Number.isNaN(cur)) return;
      commitNumber(cur + direction * baseStep);
    };

    const onWrapperPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!scrubbable || editing) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const cur = parseFloat(draft.replace("%", ""));
      if (Number.isNaN(cur)) return;
      scrubRef.current = {
        startX: e.clientX,
        startValue: cur,
        scrubbing: false,
        pointerId: e.pointerId,
      };
      // Block focus while we wait to see if this is a click or a drag
      e.preventDefault();
      wrapperRef.current?.setPointerCapture(e.pointerId);
    };

    const onWrapperPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      const state = scrubRef.current;
      if (!state) return;
      const dx = e.clientX - state.startX;
      if (!state.scrubbing && Math.abs(dx) > 3) {
        state.scrubbing = true;
        interactingRef.current = true;
      }
      if (state.scrubbing) {
        const baseStep = e.shiftKey ? (nudgeShiftStep ?? 10) : (nudgeStep ?? 1);
        commitNumber(state.startValue + dx * baseStep);
      }
    };

    const onWrapperPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      const state = scrubRef.current;
      if (!state) return;
      scrubRef.current = null;
      try {
        wrapperRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        // releasePointerCapture throws if the pointer was already released
      }
      if (state.scrubbing) {
        interactingRef.current = false;
        // Sync draft back to the (possibly clamped) value from parent
        setDraft(value);
        return;
      }
      // Click without drag → enter edit mode and focus the input
      setEditing(true);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    };

    return (
      <div
        ref={wrapperRef}
        onPointerDown={onWrapperPointerDown}
        onPointerMove={onWrapperPointerMove}
        onPointerUp={onWrapperPointerUp}
        onPointerCancel={onWrapperPointerUp}
        className={cn(
          "flex items-center h-9 px-2 bg-transparent hover:bg-hover active:bg-active transition-colors duration-80 focus-within:ring-1 focus-within:ring-[#6B97FF] select-none",
          shape.input,
          scrubbable && !editing && "cursor-ew-resize",
          className
        )}
        style={{ width }}
      >
        {prefix && (
          <span className="text-[12px] text-muted-foreground mr-1 select-none">
            {prefix}
          </span>
        )}
        <input
          ref={setInputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={(e) => {
            interactingRef.current = true;
            setEditing(true);
            e.currentTarget.select();
          }}
          onBlur={() => {
            interactingRef.current = false;
            setEditing(false);
            if (draft !== value) {
              const numeric = parseFloat(draft.replace("%", ""));
              if (!Number.isNaN(numeric) && (min != null || max != null)) {
                commitNumber(numeric);
              } else {
                onCommit(draft);
              }
            } else setDraft(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.currentTarget as HTMLInputElement).blur();
            } else if (e.key === "Escape") {
              setDraft(value);
              (e.currentTarget as HTMLInputElement).blur();
            } else if (
              (nudgeStep != null || nudgeShiftStep != null) &&
              (e.key === "ArrowUp" || e.key === "ArrowDown")
            ) {
              e.preventDefault();
              nudge(e.key === "ArrowUp" ? 1 : -1, e.shiftKey);
            }
          }}
          inputMode={inputMode}
          aria-label={ariaLabel}
          className={cn(
            "flex-1 min-w-0 bg-transparent text-foreground text-[13px] outline-none tabular-nums",
            align === "center" && "text-center",
            align === "right" && "text-right",
            scrubbable && !editing && "pointer-events-none",
            inputClassName
          )}
          style={{ fontVariationSettings: fontWeights.medium }}
        />
      </div>
    );
  }
);

ColorInput.displayName = "ColorInput";

// ---------------------------------------------------------------------------
// EyeDropperButton
// ---------------------------------------------------------------------------

interface EyeDropperGlobal {
  open(): Promise<{ sRGBHex: string }>;
}

function EyeDropperButton({ onPick }: { onPick: (hex: string) => void }) {
  const [supported, setSupported] = useState(false);
  const shape = useShape();
  const PipetteIcon = useIcon("pipette");

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "EyeDropper" in window);
  }, []);

  if (!supported) return null;

  const handleClick = async () => {
    try {
      const Ctor = (window as unknown as { EyeDropper: new () => EyeDropperGlobal }).EyeDropper;
      const eye = new Ctor();
      const result = await eye.open();
      onPick(result.sRGBHex);
    } catch {
      // user cancelled
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Pick color from screen"
      className={cn(
        "flex items-center justify-center h-9 px-3 text-muted-foreground bg-transparent hover:bg-hover hover:text-foreground active:bg-active transition-colors duration-80 outline-none focus-visible:ring-1 focus-visible:ring-[#6B97FF] cursor-pointer",
        shape.input
      )}
    >
      <PipetteIcon size={16} strokeWidth={1.5} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// ColorTileFluid (small colored square — checker behind alpha)
// ---------------------------------------------------------------------------

interface ColorTileFluidProps {
  color: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

function ColorTileFluid({ color, size = 24, className, style }: ColorTileFluidProps) {
  const shape = useShape();
  return (
    <span
      className={cn("inline-block relative shrink-0 overflow-hidden", shape.bg, className)}
      style={{
        width: size,
        height: size,
        ...CHECKER_BG,
        boxShadow: "inset 0 0 0 1px rgba(127,127,127,0.25)",
        ...style,
      }}
    >
      <span
        className="absolute inset-0"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// ColorSwatchFluid (clickable strip swatch)
// ---------------------------------------------------------------------------

const ColorSwatchFluid = forwardRef<HTMLButtonElement, ColorSwatchFluidProps>(
  ({ color, size = 28, selected, className, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const shape = useShape();
    const [hovered, setHovered] = useState(false);
    const ring = selected
      ? "inset 0 0 0 1px rgba(127,127,127,0.25), 0 0 0 2px var(--background), 0 0 0 4px #6B97FF"
      : hovered
        ? "inset 0 0 0 1px rgba(127,127,127,0.25), 0 0 0 2px var(--background), 0 0 0 4px rgba(127,127,127,0.4)"
        : "inset 0 0 0 1px rgba(127,127,127,0.25)";
    return (
      <button
        ref={ref}
        type="button"
        aria-label={`Select color ${color}`}
        className={cn(
          "relative shrink-0 overflow-hidden cursor-pointer outline-none transition-shadow duration-100",
          shape.bg,
          className
        )}
        style={{
          width: size,
          height: size,
          ...CHECKER_BG,
          boxShadow: ring,
        }}
        onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e); }}
        onMouseLeave={(e) => { setHovered(false); onMouseLeave?.(e); }}
        {...props}
      >
        <span
          className="absolute inset-0"
          style={{ backgroundColor: color }}
        />
      </button>
    );
  }
);

ColorSwatchFluid.displayName = "ColorSwatchFluid";

// ---------------------------------------------------------------------------
// SwatchStrip
// ---------------------------------------------------------------------------

function SwatchStrip({
  swatches,
  current,
  onPick,
}: {
  swatches: string[];
  current: string;
  onPick: (color: string) => void;
}) {
  const normalizedCurrent = useMemo(() => {
    const p = parseColor(current);
    return p ? rgbToHexStr(p.r, p.g, p.b, p.a).toLowerCase() : "";
  }, [current]);

  return (
    <div className="flex flex-wrap gap-2">
      {swatches.map((sw, i) => {
        const parsed = parseColor(sw);
        const normalized = parsed
          ? rgbToHexStr(parsed.r, parsed.g, parsed.b, parsed.a).toLowerCase()
          : sw.toLowerCase();
        const isSelected = normalized === normalizedCurrent;
        return (
          <ColorSwatchFluid
            key={`${sw}-${i}`}
            color={sw}
            size={28}
            selected={isSelected}
            onClick={() => onPick(sw)}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ColorPickerFluid (panel)
// ---------------------------------------------------------------------------

const ColorPickerFluid = forwardRef<HTMLDivElement, ColorPickerFluidProps>(
  (
    {
      value,
      defaultValue = "#6B97FF",
      onValueChange,
      format,
      defaultFormat = "hex",
      onFormatChange,
      swatches,
      hideEyedropper,
      formatOpen,
      defaultFormatOpen,
      className,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(value ?? defaultValue);
    const currentRawValue = isControlled ? (value as string) : internalValue;

    const isFormatControlled = format !== undefined;
    const [internalFormat, setInternalFormat] = useState<ColorFormat>(defaultFormat);
    const currentFormat = isFormatControlled ? (format as ColorFormat) : internalFormat;

    // Internal HSV state (canonical). H is preserved across S=0 / V=0 transitions.
    const initialParsed = useMemo(() => {
      const p = parseColor(currentRawValue);
      if (!p) return { h: 0, s: 1, v: 1, a: 1 };
      const hsv = rgbToHsv(p.r, p.g, p.b);
      return { h: hsv.s === 0 ? 0 : hsv.h, s: hsv.s, v: hsv.v, a: p.a };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const [hsv, setHsv] = useState(initialParsed);

    // Sticky OKLCH hue: preserves the user's stated OKLCH H across the lossy
    // RGB round-trip (so the displayed H doesn't drift after release) and
    // across achromatic colors (where RGB-derived H would collapse to 0).
    // Cleared whenever the color changes through a non-OKLCH-internal channel.
    const oklchHueRef = useRef<number | null>(null);

    // External value sync — when controlled value changes from outside, sync HSV
    const lastEmittedRef = useRef<string>("");
    useEffect(() => {
      if (!isControlled) return;
      const emitted = lastEmittedRef.current;
      const cur = value as string;
      if (cur === emitted) return;
      const p = parseColor(cur);
      if (!p) return;
      oklchHueRef.current = null;
      const newHsv = rgbToHsv(p.r, p.g, p.b);
      setHsv((prev) => ({
        h: newHsv.s === 0 ? prev.h : newHsv.h,
        s: newHsv.s,
        v: newHsv.v,
        a: p.a,
      }));
    }, [value, isControlled]);

    const parsed = useMemo(
      () => buildParsed(hsv.h, hsv.s, hsv.v, hsv.a),
      [hsv]
    );

    const updateHsv = useCallback(
      (next: { h?: number; s?: number; v?: number; a?: number }) => {
        const merged = { ...hsv, ...next };
        setHsv(merged);
        const p = buildParsed(merged.h, merged.s, merged.v, merged.a);
        const formatted = formatValueByFormat(p, currentFormat);
        lastEmittedRef.current = formatted;
        if (!isControlled) setInternalValue(formatted);
        onValueChange?.(formatted, p);
      },
      [hsv, currentFormat, isControlled, onValueChange]
    );

    const handleFormatChange = useCallback(
      (f: ColorFormat) => {
        if (!isFormatControlled) setInternalFormat(f);
        onFormatChange?.(f);
        // Re-emit value in new format
        const formatted = formatValueByFormat(parsed, f);
        lastEmittedRef.current = formatted;
        if (!isControlled) setInternalValue(formatted);
        onValueChange?.(formatted, parsed);
      },
      [isFormatControlled, isControlled, onFormatChange, onValueChange, parsed]
    );

    const handleHexCommit = useCallback(
      (input: string) => {
        const p = parseColor(input);
        if (!p) return;
        oklchHueRef.current = null;
        const newHsv = rgbToHsv(p.r, p.g, p.b);
        const merged = {
          h: newHsv.s === 0 ? hsv.h : newHsv.h,
          s: newHsv.s,
          v: newHsv.v,
          a: p.a,
        };
        setHsv(merged);
        const next = buildParsed(merged.h, merged.s, merged.v, merged.a);
        const formatted = formatValueByFormat(next, currentFormat);
        lastEmittedRef.current = formatted;
        if (!isControlled) setInternalValue(formatted);
        onValueChange?.(formatted, next);
      },
      [hsv.h, currentFormat, isControlled, onValueChange]
    );

    const handleSwatchPick = useCallback(
      (sw: string) => {
        handleHexCommit(sw);
      },
      [handleHexCommit]
    );

    const handleEyedrop = useCallback(
      (hex: string) => {
        handleHexCommit(hex);
      },
      [handleHexCommit]
    );

    const solidHueRgb = useMemo(() => hsvToRgb(hsv.h, hsv.s, hsv.v), [hsv.h, hsv.s, hsv.v]);
    const solidR = Math.round(solidHueRgb.r);
    const solidG = Math.round(solidHueRgb.g);
    const solidB = Math.round(solidHueRgb.b);
    const solidColorString = `rgb(${solidR}, ${solidG}, ${solidB})`;
    const shape = useShape();
    const substrate = useSurface();
    // The picker panel uses bg-card (surface-3) by default; when wrapped in
    // ColorPickerFluidPopover the className override pushes it higher. Either way,
    // announce the panel's effective level so descendants (FormatDropdown,
    // etc.) elevate above it instead of colliding at the same surface.
    const pickerLevel = Math.max(substrate, 3);

    return (
      <SurfaceProvider value={pickerLevel}>
      <div
        ref={ref}
        className={cn("flex flex-col gap-2 p-3", surfaceClasses(pickerLevel, 1), shape.container, className)}
        style={{ width: PANEL_WIDTH }}
        {...props}
      >
        <SaturationSquare
          h={hsv.h}
          s={hsv.s}
          v={hsv.v}
          onChange={(s, v) => updateHsv({ s, v })}
        />

        <div className="flex flex-col [&>*]:mb-0 [&>*+*]:-mt-px">
          <HueSlider h={hsv.h} onChange={(h) => { oklchHueRef.current = null; updateHsv({ h }); }} />
          <AlphaSlider
            a={hsv.a}
            solidColor={solidColorString}
            solidR={solidR}
            solidG={solidG}
            solidB={solidB}
            onChange={(a) => updateHsv({ a })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormatDropdown
            value={currentFormat}
            onChange={handleFormatChange}
            open={formatOpen}
            defaultOpen={defaultFormatOpen}
          />
          {!hideEyedropper && <EyeDropperButton onPick={handleEyedrop} />}
        </div>

        <ColorInputsRow
          parsed={parsed}
          format={currentFormat}
          oklchHue={oklchHueRef.current}
          onChannelChange={(channel, value) => {
            const p = { ...parsed };
            switch (channel) {
              case "hex": handleHexCommit(value as string); return;
              case "r": case "g": case "b": {
                oklchHueRef.current = null;
                const r = channel === "r" ? Number(value) : p.r;
                const g = channel === "g" ? Number(value) : p.g;
                const b = channel === "b" ? Number(value) : p.b;
                const hsvVal = rgbToHsv(r, g, b);
                updateHsv({
                  h: hsvVal.s === 0 ? hsv.h : hsvVal.h,
                  s: hsvVal.s,
                  v: hsvVal.v,
                });
                return;
              }
              case "hSL": case "sSL": case "lSL": {
                if (channel === "hSL") oklchHueRef.current = null;
                const hsl = rgbToHsl(p.r, p.g, p.b);
                const h2 = channel === "hSL" ? Number(value) : hsl.h;
                const s2 = channel === "sSL" ? Number(value) / 100 : hsl.s;
                const l2 = channel === "lSL" ? Number(value) / 100 : hsl.l;
                const rgb = hslToRgb(h2, clamp01(s2), clamp01(l2));
                const hsvVal = rgbToHsv(rgb.r, rgb.g, rgb.b);
                updateHsv({
                  h: hsvVal.s === 0 ? h2 : hsvVal.h,
                  s: hsvVal.s,
                  v: hsvVal.v,
                });
                return;
              }
              case "L": case "C": case "H": {
                const cur = rgbToOklch(p.r, p.g, p.b);
                // For L/C edits, anchor on the user's last stated H so we
                // don't drift along with chroma changes.
                const baseH = oklchHueRef.current ?? cur.H;
                const L = channel === "L" ? Number(value) / 100 : cur.L;
                const C = channel === "C" ? Number(value) : cur.C;
                const H = channel === "H" ? Number(value) : baseH;
                oklchHueRef.current = H;
                const rgb = oklchToRgb(clamp01(L), Math.max(0, C), H);
                const hsvVal = rgbToHsv(rgb.r, rgb.g, rgb.b);
                updateHsv({
                  h: hsvVal.s === 0 ? hsv.h : hsvVal.h,
                  s: hsvVal.s,
                  v: hsvVal.v,
                });
                return;
              }
              case "alphaPercent": {
                const a = clamp01(Number(value) / 100);
                updateHsv({ a });
                return;
              }
            }
          }}
        />

        {swatches && swatches.length > 0 && (
          <SwatchStrip
            swatches={swatches}
            current={parsed.hex}
            onPick={handleSwatchPick}
          />
        )}
      </div>
      </SurfaceProvider>
    );
  }
);

ColorPickerFluid.displayName = "ColorPickerFluid";

// ---------------------------------------------------------------------------
// ColorInputsRow — adapts inputs to format
// ---------------------------------------------------------------------------

type ChannelKey =
  | "hex"
  | "r" | "g" | "b"
  | "hSL" | "sSL" | "lSL"
  | "L" | "C" | "H"
  | "alphaPercent";

function ColorInputsRow({
  parsed,
  format,
  oklchHue,
  onChannelChange,
}: {
  parsed: ParsedColor;
  format: ColorFormat;
  /** Sticky OKLCH hue override for display (preserves user's stated H across round-trip drift). */
  oklchHue?: number | null;
  onChannelChange: (key: ChannelKey, value: string) => void;
}) {
  const alphaPct = Math.round(parsed.a * 100);

  if (format === "hex") {
    const hexNoHash = parsed.hex.replace(/^#/, "").toUpperCase();
    return (
      <div className="grid grid-cols-2 gap-2">
        <ChannelTooltip label="Hex">
          <ColorInput
            value={hexNoHash}
            onCommit={(next) => onChannelChange("hex", next.startsWith("#") ? next : `#${next}`)}
            ariaLabel="Hex value"
            prefix="#"
          />
        </ChannelTooltip>
        <AlphaInput value={alphaPct} onCommit={(n) => onChannelChange("alphaPercent", String(n))} />
      </div>
    );
  }

  if (format === "rgb") {
    return (
      <div className="grid grid-cols-4 gap-1">
        <ChannelTooltip label="Red"><ColorInput value={String(parsed.r)} onCommit={(n) => onChannelChange("r", n)} ariaLabel="Red" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={255} /></ChannelTooltip>
        <ChannelTooltip label="Green"><ColorInput value={String(parsed.g)} onCommit={(n) => onChannelChange("g", n)} ariaLabel="Green" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={255} /></ChannelTooltip>
        <ChannelTooltip label="Blue"><ColorInput value={String(parsed.b)} onCommit={(n) => onChannelChange("b", n)} ariaLabel="Blue" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={255} /></ChannelTooltip>
        <AlphaInput value={alphaPct} onCommit={(n) => onChannelChange("alphaPercent", String(n))} />
      </div>
    );
  }

  if (format === "hsl") {
    const hsl = rgbToHsl(parsed.r, parsed.g, parsed.b);
    return (
      <div className="grid grid-cols-4 gap-1">
        <ChannelTooltip label="Hue"><ColorInput value={String(Math.round(hsl.h))} onCommit={(n) => onChannelChange("hSL", n)} ariaLabel="Hue" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={360} wrap /></ChannelTooltip>
        <ChannelTooltip label="Saturation"><ColorInput value={String(Math.round(hsl.s * 100))} onCommit={(n) => onChannelChange("sSL", n)} ariaLabel="Saturation" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={100} /></ChannelTooltip>
        <ChannelTooltip label="Lightness"><ColorInput value={String(Math.round(hsl.l * 100))} onCommit={(n) => onChannelChange("lSL", n)} ariaLabel="Lightness" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={100} /></ChannelTooltip>
        <AlphaInput value={alphaPct} onCommit={(n) => onChannelChange("alphaPercent", String(n))} />
      </div>
    );
  }

  // oklch
  const oklch = rgbToOklch(parsed.r, parsed.g, parsed.b);
  const displayH = oklchHue ?? oklch.H;
  return (
    <div className="grid grid-cols-4 gap-1">
      <ChannelTooltip label="Lightness"><ColorInput value={(oklch.L * 100).toFixed(0)} onCommit={(n) => onChannelChange("L", n)} ariaLabel="Lightness" align="center" inputMode="decimal" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={100} /></ChannelTooltip>
      <ChannelTooltip label="Chroma"><ColorInput value={oklch.C.toFixed(2)} onCommit={(n) => onChannelChange("C", n)} ariaLabel="Chroma" align="center" inputMode="decimal" nudgeStep={0.01} nudgeShiftStep={0.1} decimals={2} scrubbable min={0} max={0.4} /></ChannelTooltip>
      <ChannelTooltip label="Hue"><ColorInput value={displayH.toFixed(0)} onCommit={(n) => onChannelChange("H", n)} ariaLabel="Hue" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={360} wrap /></ChannelTooltip>
      <AlphaInput value={alphaPct} onCommit={(n) => onChannelChange("alphaPercent", String(n))} />
    </div>
  );
}

function ChannelTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <TooltipFluid content={label} delayDuration={300}>
      <div>{children}</div>
    </TooltipFluid>
  );
}

function AlphaInput({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  return (
    <ChannelTooltip label="Alpha">
      <ColorInput
        value={`${value}%`}
        onCommit={(input) => {
          const n = parseFloat(input.replace("%", ""));
          if (Number.isNaN(n)) return;
          onCommit(Math.max(0, Math.min(100, Math.round(n))));
        }}
        ariaLabel="Alpha"
        align="center"
        inputMode="numeric"
        nudgeStep={1}
        nudgeShiftStep={10}
        hasPercent
        scrubbable
        min={0}
        max={100}
      />
    </ChannelTooltip>
  );
}

// ---------------------------------------------------------------------------
// ColorPickerFluidPopover (trigger button + portal panel)
// ---------------------------------------------------------------------------

const ColorPickerFluidPopover = forwardRef<HTMLDivElement, ColorPickerFluidPopoverProps>(
  (
    {
      triggerLabel,
      triggerLabelPosition = "left",
      triggerShowValue = true,
      triggerShowRemove = false,
      onTriggerRemove,
      triggerClassName,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      ...pickerProps
    },
    ref
  ) => {
    const isOpenControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const open = isOpenControlled ? openProp : internalOpen;
    const setOpen = useCallback(
      (next: boolean | ((prev: boolean) => boolean)) => {
        const resolved = typeof next === "function" ? next(open) : next;
        if (!isOpenControlled) setInternalOpen(resolved);
        onOpenChange?.(resolved);
      },
      [open, isOpenControlled, onOpenChange]
    );
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const shape = useShape();
    const substrate = useSurface();
    const level = Math.min(substrate + 2, 8);

    const isControlled = pickerProps.value !== undefined;
    const [internalValue, setInternalValue] = useState(pickerProps.value ?? pickerProps.defaultValue ?? "#6B97FF");
    const currentValue = isControlled ? (pickerProps.value as string) : internalValue;

    const onValueChange = useCallback(
      (v: string, parsed: ParsedColor) => {
        if (!isControlled) setInternalValue(v);
        pickerProps.onValueChange?.(v, parsed);
      },
      [isControlled, pickerProps]
    );

    useEffect(() => {
      if (!open || !triggerRef.current) {
        setRect(null);
        return;
      }
      const update = () => {
        if (triggerRef.current) {
          setRect(triggerRef.current.getBoundingClientRect());
        }
      };
      update();
      window.addEventListener("scroll", update, { passive: true, capture: true });
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update, { capture: true } as EventListenerOptions);
        window.removeEventListener("resize", update);
      };
    }, [open]);

    useEffect(() => {
      if (!open) return;
      const onClick = (e: MouseEvent) => {
        if (
          !panelRef.current?.contains(e.target as Node) &&
          !triggerRef.current?.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onClick);
        document.removeEventListener("keydown", onKey);
      };
    }, [open, setOpen]);

    const XIcon = useIcon("x");
    const parsed = useMemo(() => parseColor(currentValue), [currentValue]);
    const swatchColor = parsed
      ? rgbToHexStr(parsed.r, parsed.g, parsed.b, parsed.a)
      : currentValue;
    const valueLabel = parsed
      ? rgbToHexStr(parsed.r, parsed.g, parsed.b, 1).replace(/^#/, "").toUpperCase()
      : currentValue;

    return (
      <div ref={ref} className="inline-flex">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            "flex items-center gap-2 h-9 px-2 border border-border bg-transparent hover:bg-hover transition-colors duration-80 outline-none focus-visible:ring-1 focus-visible:ring-[#6B97FF] cursor-pointer",
            shape.input,
            triggerClassName
          )}
          style={{ fontVariationSettings: fontWeights.medium }}
        >
          {triggerLabel && triggerLabelPosition === "left" && (
            <span className="text-[13px] text-muted-foreground px-1 select-none">
              {triggerLabel}
            </span>
          )}
          <ColorTileFluid color={swatchColor} size={20} />
          {triggerShowValue && (
            <span className="text-[13px] text-foreground tabular-nums">
              {valueLabel}
            </span>
          )}
          {triggerLabel && triggerLabelPosition === "right" && (
            <span className="text-[13px] text-muted-foreground px-1 select-none">
              {triggerLabel}
            </span>
          )}
          {triggerShowRemove && (
            <span
              role="button"
              aria-label="Remove color"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onTriggerRemove?.();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  e.preventDefault();
                  onTriggerRemove?.();
                }
              }}
              className="ml-1 text-muted-foreground hover:text-foreground cursor-pointer flex items-center"
            >
              <XIcon size={14} strokeWidth={1.5} />
            </span>
          )}
        </button>
        {open && rect && typeof document !== "undefined" && createPortal(
          <div
            style={{
              position: "fixed",
              top: rect.bottom + 6,
              left: rect.left,
              zIndex: 50,
            }}
          >
            <AnimatePresence>
              <motion.div
                ref={(node) => {
                  (panelRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                  setPanelEl(node);
                }}
                initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -4, scaleY: 0.96 }}
                transition={springs.moderate}
                style={{ transformOrigin: "top left" }}
              >
                <ColorPickerFluidPortalContainer value={panelEl}>
                  <SurfaceProvider value={level}>
                    <ColorPickerFluid
                      {...pickerProps}
                      value={currentValue}
                      onValueChange={onValueChange}
                      className={cn(
                        surfaceClasses(level, 3),
                        pickerProps.className
                      )}
                    />
                  </SurfaceProvider>
                </ColorPickerFluidPortalContainer>
              </motion.div>
            </AnimatePresence>
          </div>,
          document.body
        )}
      </div>
    );
  }
);

ColorPickerFluidPopover.displayName = "ColorPickerFluidPopover";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  ColorPickerFluid,
  ColorPickerFluidPopover,
  ColorPickerFluidPortalContainer,
  ColorSwatchFluid,
  ColorTileFluid,
};

export type {
  ColorPickerFluidProps,
  ColorPickerFluidPopoverProps,
  ColorSwatchFluidProps,
  ColorFormat,
  ParsedColor,
};
