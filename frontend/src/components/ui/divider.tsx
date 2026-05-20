"use client";

import clsx from "clsx";

type DividerProps = {
  className?: string;
};

export function Divider({ className }: DividerProps) {
  return (
    <div className={clsx("w-full border-t border-border/50", className)} />
  );
}
