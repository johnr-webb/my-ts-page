export let savedTheme = (() => {
  try {
    const v = localStorage.getItem("theme");
    console.log("Detecting theme preference... found:", v);
    if (v) return v;
  } catch {}
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
})();

export function setupThemeToggle(button: HTMLButtonElement) {
  button.addEventListener("click", () => {
    savedTheme = savedTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    console.log("Changed theme to:", savedTheme);
    button.textContent = savedTheme === "dark" ? "Light Mode" : "Dark Mode";
  });
}
