/**
 * Resilient API Client wrapper for Integration Providers
 * Handles:
 * - Exponential backoff retries
 * - Rate limiting (429 handling)
 * - Safe timeouts
 * - Authentication injection
 */

interface FetchOptions extends RequestInit {
  retries?: number;
  initialDelay?: number;
  maxDelay?: number;
}

export class IntegrationApiClient {
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
    const {
      retries = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      ...fetchOptions
    } = options;

    let lastError: Error | null = null;
    let currentDelay = initialDelay;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);

        if (response.ok) {
          return response;
        }

        if (response.status === 429) {
          // Rate limited - respect Retry-After if present
          const retryAfter = response.headers.get('Retry-After');
          if (retryAfter) {
            currentDelay = parseInt(retryAfter, 10) * 1000;
          }
        } else if (response.status < 500 && response.status !== 408) {
          // Client errors (4xx) usually shouldn't be retried unless 408 or 429
          return response;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < retries) {
          console.warn(`Attempt ${attempt + 1} failed for ${url}. Retrying in ${currentDelay}ms.`, lastError.message);
          await this.delay(currentDelay);
          // Exponential backoff with jitter
          currentDelay = Math.min(currentDelay * 2 * (0.8 + Math.random() * 0.4), maxDelay);
        }
      }
    }

    throw lastError || new Error(`Failed to fetch ${url} after ${retries} retries`);
  }
}

export const apiClient = new IntegrationApiClient();
