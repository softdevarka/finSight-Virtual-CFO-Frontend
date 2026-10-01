import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchWithRetry(url: string | URL | Request, options?: RequestInit, retries = 3, backoff = 1000): Promise<Response> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await fetch(url, options);
      // If the response is 502/503 or 429, we retry
      if (!response.ok && [429, 502, 503, 504].includes(response.status)) {
        throw new Error(`Server returned ${response.status}`);
      }
      return response;
    } catch (error) {
      attempt++;
      console.warn(`Fetch attempt ${attempt} failed for ${url.toString()}. Retrying in ${backoff}ms...`, error);
      if (attempt >= retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, backoff));
      backoff *= 2; // exponential backoff
    }
  }
  throw new Error("Unreachable");
}
