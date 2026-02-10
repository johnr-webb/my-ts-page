/**
 * Base component class providing common functionality for all UI components
 */

export abstract class BaseComponent {
  protected element: HTMLElement;
  protected eventController: AbortController | null = null;
  protected isDestroyed = false;

  constructor(mount: HTMLElement) {
    this.element = mount;
  }

  /**
   * Initialize the component
   */
  init(): void {
    this.setupEventListeners();
    this.render();
  }

  /**
   * Render the component - must be implemented by subclasses
   */
  protected abstract render(): void;

  /**
   * Setup event listeners - can be implemented by subclasses
   */
  protected setupEventListeners(): void {
    // Default implementation - can be overridden
  }

  /**
   * Add event listener with automatic cleanup
   */
  protected addEventListener<T extends Event>(
    target: EventTarget,
    type: string,
    listener: (event: T) => void,
    options?: AddEventListenerOptions
  ): void {
    if (!this.eventController) {
      this.eventController = new AbortController();
    }
    
    target.addEventListener(type, listener as EventListener, {
      ...options,
      signal: this.eventController.signal
    });
  }

  /**
   * Dispatch custom event with proper typing
   */
  protected dispatchEvent<T = unknown>(type: string, detail: T): void {
    const event = new CustomEvent<T>(type, { detail });
    this.element.dispatchEvent(event);
    window.dispatchEvent(event); // Also dispatch on window for global listeners
  }

  /**
   * Clean up event listeners and resources
   */
  destroy(): void {
    if (this.eventController) {
      this.eventController.abort();
      this.eventController = null;
    }
    this.isDestroyed = true;
  }

  /**
   * Check if component is destroyed
   */
  get isActive(): boolean {
    return !this.isDestroyed;
  }
}