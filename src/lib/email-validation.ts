import { z } from "zod";

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const EMAIL_ERROR_MESSAGE = "Please enter a valid email address.";

export function validateEmail(value: string): { valid: boolean; message?: string } {
  if (!value) return { valid: false };
  if (EMAIL_REGEX.test(value)) return { valid: true };
  return { valid: false, message: EMAIL_ERROR_MESSAGE };
}

/** Drop-in replacement for `.email()` in zod schemas */
export const zodEmail = () =>
  z
    .string()
    .trim()
    .max(255, "Email must be less than 255 characters")
    .refine((v) => EMAIL_REGEX.test(v), { message: EMAIL_ERROR_MESSAGE });
