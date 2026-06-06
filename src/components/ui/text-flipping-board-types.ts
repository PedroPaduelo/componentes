export interface TextFlippingBoardProps {
  rows?: string[];
  text?: string;
  className?: string;
  /** Total animation duration in seconds. Defaults to ~1.2s. */
  duration?: number;
}

export type AccentColor = {
  top: string;
  bottom: string;
  text: string;
};

export type ParsedCell =
  | { type: "char"; value: string }
  | { type: "color"; hex: string };
