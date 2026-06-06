import { TextFlippingBoard } from "@/components/ui/text-flipping-board";
import type { Example } from "./examples";

export const examplesTextFlippingBoard: Record<string, Example[]> = {
  "text-flipping-board": [
    {
      title: "Básico",
      description:
        "Split-flap board estilo aeroporto com texto centralizado e animação em cascata.",
      code: `<div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-neutral-100 p-6 dark:bg-neutral-950">
  <TextFlippingBoard
    text="WELCOME TO THE BOARD"
    className="h-full w-full"
  />
</div>`,
      render: (
        <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-neutral-100 p-6 dark:bg-neutral-950">
          <TextFlippingBoard
            text="WELCOME TO THE BOARD"
            className="h-full w-full"
          />
        </div>
      ),
    },
  ],
};
