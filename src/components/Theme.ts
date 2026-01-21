export function setupThemeToggle(button: HTMLButtonElement) {
  const PREFERENCE_EXPIRY_DAYS = 7;

  const getInitialTheme = (): "light" | "dark" => {
    try {
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      const timestamp = localStorage.getItem("theme-timestamp");

      if (stored && timestamp) {
        const daysSinceSet =
          (Date.now() - parseInt(timestamp)) / (1000 * 60 * 60 * 24);

        // If preference is older than expiry days, reset to system preference
        if (daysSinceSet > PREFERENCE_EXPIRY_DAYS) {
          localStorage.removeItem("theme");
          localStorage.removeItem("theme-timestamp");
        } else {
          return stored;
        }
      }
    } catch {}

    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const applyTheme = (theme: "light" | "dark") => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    localStorage.setItem("theme-timestamp", Date.now().toString());
    button.textContent = theme === "dark" ? "🌙" : "☀️";
  };

  if (!document.documentElement.dataset.theme) {
    applyTheme(getInitialTheme());
  } else {
    button.textContent =
      document.documentElement.dataset.theme === "dark" ? "🌙" : "☀️";
  }

  button.addEventListener("click", (e) => {
    e.preventDefault();
    const current = document.documentElement.dataset.theme as "light" | "dark";
    const nextTheme = current === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
  });
}
