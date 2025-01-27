import { ErrorWithMessage } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return typeof error === "object" && error !== null && "message" in error;
}

export function extractErrorMessage(error: unknown): string {
  return isErrorWithMessage(error)
    ? error.message
    : "An unexpected error occurred";
}
