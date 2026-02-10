

export function setupThemeToggle(button: HTMLButtonElement): void {
  const PREFERENCE_EXPIRY_DAYS = 7;

  const handleError = (error: Error | unknown, context: string): void => {
    console.error(`[Theme] ${context}:`, error);
  };

  const getInitialTheme = (): "light" | "dark" => {
    try {
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      const timestamp = localStorage.getItem("theme-timestamp");

      if (stored && timestamp) {
        const daysSinceSet =
          (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60 * 24);

        if (daysSinceSet > PREFERENCE_EXPIRY_DAYS) {
          localStorage.removeItem("theme");
          localStorage.removeItem("theme-timestamp");
        } else {
          return stored;
        }
      }
    } catch (error) {
      handleError(error, 'getInitialTheme');
    }
    
    // Default to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const applyTheme = (theme: "light" | "dark"): void => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      button.textContent = theme === "light" ? "🌙" : "☀️";
      
      try {
        localStorage.setItem("theme", theme);
        localStorage.setItem("theme-timestamp", Date.now().toString());
      } catch (error) {
        handleError(error, 'saveThemePreference');
      }
    } catch (error) {
      handleError(error, 'applyTheme');
    }
  };

  const toggleTheme = (): void => {
    try {
      const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || getInitialTheme();
      const newTheme = currentTheme === "light" ? "dark" : "light";
      applyTheme(newTheme);
    } catch (error) {
      handleError(error, 'toggleTheme');
    }
  };

  // Initialize theme
  try {
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);

    // Setup event listener
    button.addEventListener("click", toggleTheme);

    // Listen for system theme changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      try {
        const userPreference = localStorage.getItem("theme") as "light" | "dark" | null;
        if (!userPreference) {
          // Only auto-switch if user hasn't manually set preference
          applyTheme(e.matches ? "dark" : "light");
        }
      } catch (error) {
        handleError(error, 'systemThemeChange');
      }
    });
  } catch (error) {
    handleError(error, 'themeInitialization');
  }
}