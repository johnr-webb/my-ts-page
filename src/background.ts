export function setupBackground(
  selectEl: HTMLSelectElement,
  submitBtn: HTMLButtonElement
) {
  const saved = localStorage.getItem("custom-bg");
  if (saved) document.documentElement.style.setProperty("--custom-bg", saved);

  submitBtn.addEventListener("click", () => {
    const color = selectEl.value;
    document.documentElement.style.setProperty("--custom-bg", color);
    try {
      localStorage.setItem("custom-bg", color);
    } catch {}
  });
}
