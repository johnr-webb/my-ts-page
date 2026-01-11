export function setupThemeToggle(button: HTMLParagraphElement) {
  const getInitialTheme = (): "light" | "dark" => {
    try {
      const stored = localStorage.getItem("theme") as "light" | "dark" | null;
      if (stored) return stored;
    } catch {}

    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const applyTheme = (theme: "light" | "dark") => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
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
