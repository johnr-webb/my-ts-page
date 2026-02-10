/**
 * Base service class providing common functionality for all services
 */

export abstract class BaseService {
  protected eventTarget: EventTarget = new EventTarget();
  protected isDestroyed = false;

  /**
   * Add event listener with proper typing
   */
  public addEventListener<T = unknown>(
    type: string,
    listener: (event: CustomEvent<T>) => void
  ): void {
    this.eventTarget.addEventListener(type, listener as EventListener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener<T = unknown>(
    type: string,
    listener: (event: CustomEvent<T>) => void
  ): void {
    this.eventTarget.removeEventListener(type, listener as EventListener);
  }

  /**
   * Dispatch custom event with proper typing
   */
  protected dispatchEvent<T = unknown>(type: string, detail: T): void {
    const event = new CustomEvent<T>(type, { detail });
    this.eventTarget.dispatchEvent(event);
    
    // Also dispatch on window for global listeners
    window.dispatchEvent(event);
  }

  /**
   * Handle errors consistently across services
   */
  protected handleError(
    error: Error | unknown,
    context: string
  ): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${this.constructor.name}] ${context}:`, error);
    
    // Dispatch error event for global error handling
    this.dispatchEvent('serviceError', {
      service: this.constructor.name,
      context,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Async operation wrapper with consistent error handling
   */
  protected async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string,
    fallbackValue?: T
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error, context);
      return fallbackValue;
    }
  }

  /**
   * Check if service is destroyed
   */
  get isActive(): boolean {
    return !this.isDestroyed;
  }

  /**
   * Clean up service resources
   */
  destroy(): void {
    this.isDestroyed = true;
  }
}