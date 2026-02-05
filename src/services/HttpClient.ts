// src/services/HttpClient.ts

export class HttpClient {
  private static DEFAULT_TIMEOUT = 10000; // 10 seconds

  static async get<T>(
    url: string, 
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    return this.request<T>(url, {
      method: 'GET',
      headers,
      timeout
    });
  }

  static async post<T, U = Record<string, any>>(
    url: string, 
    data: U, 
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<T> {
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    return this.request<T>(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(data),
      timeout
    });
  }

  private static async request<T>(
    url: string,
    options: {
      method: string;
      headers?: Record<string, string>;
      body?: string;
      timeout?: number;
    }
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, options.timeout || this.DEFAULT_TIMEOUT);

    try {
      console.log(`[HttpClient] ${options.method} ${url}`);
      
      const response = await fetch(url, {
        method: options.method,
        headers: options.headers,
        body: options.body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Log response status
      console.log(`[HttpClient] Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        // Try to get error details from response body
        try {
          const errorBody = await response.text();
          if (errorBody) {
            console.log(`[HttpClient] Error body:`, errorBody);
            errorMessage += ` - ${errorBody}`;
          }
        } catch (e) {
          // Ignore error parsing error body
        }

        throw new ApiError(errorMessage, response.status, 'HttpClient');
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (!text) {
          return {} as T;
        }
        
        // Try to parse as JSON anyway
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new ApiError(
            `Invalid JSON response: ${text.substring(0, 100)}...`,
            0,
            'HttpClient'
          );
        }
      }

      const result = await response.json();
      console.log(`[HttpClient] Success:`, Object.keys(result));
      return result;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      // Handle fetch-specific errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(
            `Request timeout after ${options.timeout || this.DEFAULT_TIMEOUT}ms`,
            0,
            'HttpClient'
          );
        }

        if (error.message.includes('fetch')) {
          throw new ApiError(
            `Network error: ${error.message}`,
            0,
            'HttpClient'
          );
        }
      }

      // Generic error fallback
      throw new ApiError(
        `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        'HttpClient'
      );
    }
  }

  // Utility method for checking if a URL is reachable
  static async isReachable(url: string, timeout?: number): Promise<boolean> {
    try {
      await this.get(url, undefined, timeout || 5000);
      return true;
    } catch (error) {
      console.log(`[HttpClient] URL not reachable: ${url}`, error);
      return false;
    }
  }

  // Utility method for HEAD requests (useful for health checks)
  static async head(url: string, headers?: Record<string, string>, timeout: number = 5000): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      return false;
    }
  }
}

export class ApiError extends Error {
  status: number;
  provider: string;

  constructor(
    message: string,
    status: number,
    provider: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.provider = provider;
  }

  // Helper method to check if error is a specific type
  isNetworkError(): boolean {
    return this.status === 0;
  }

  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  isTimeout(): boolean {
    return this.message.includes('timeout');
  }
}