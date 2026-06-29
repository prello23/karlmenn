import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number of ISK as a readable amount, e.g. 2.500 kr. */
export function formatISK(amount: number): string {
  return new Intl.NumberFormat("is-IS", {
    style: "currency",
    currency: "ISK",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Relative-ish Icelandic date formatting for forum threads. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("is-IS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
