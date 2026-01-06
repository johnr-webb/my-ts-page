function applyTheme(theme: string) {
  document.documentElement.setAttribute("data-theme", theme);
  console.log(`Applied theme: ${theme}`);
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

export const savedTheme = (() => {
  try {
    const v = localStorage.getItem("theme");
    console.log(`Loaded saved theme: ${v}`);
    if (v) return v;
  } catch {}
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
})();

export function setupThemeToggle(element: HTMLButtonElement) {
  const toggleTheme = () => {
    const current =
      document.documentElement.getAttribute("data-theme") === "light"
        ? "dark"
        : "light";
    applyTheme(current);
    element.setAttribute("aria-pressed", (current === "light").toString());
  };
  element.addEventListener("click", () => {
    toggleTheme();
  });
  applyTheme(savedTheme);
}

//  export function setupBackground(
//    selectEl: HTMLSelectElement,
//    submitBtn: HTMLButtonElement
//  ) {
//    const saved = localStorage.getItem("custom-bg");
//    if (saved) document.documentElement.style.setProperty("--custom-bg", saved);

//    submitBtn.addEventListener("click", () => {
//      const color = selectEl.value;
//      document.documentElement.style.setProperty("--custom-bg", color);
//      try {
//        localStorage.setItem("custom-bg", color);
//      } catch {}
//    });
//  }
