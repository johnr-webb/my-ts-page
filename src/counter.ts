export function setupCounter(element: HTMLButtonElement) {
  let counter = 0;
  const setCounter = (count: number) => {
    counter = count;
    element.innerHTML = `count is currently ${counter}`;
    element.classList.remove("counter--zero", "counter--low", "counter--high");
    if (counter >= 4) {
      element.classList.add("counter--high");
    } else if (counter >= 1) {
      element.classList.add("counter--low");
    } else {
      element.classList.add("counter--zero");
    }
  };
  element.addEventListener("click", () => {
    setCounter(counter + 1);
    // bump accent lightness a bit on each click (clamped)
    try {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      const raw = styles.getPropertyValue("--accent-l").trim();
      const current = parseFloat(raw || "45");
      const step = 6; // percent per click
      const next = Math.min(95, current + step);
      root.style.setProperty("--accent-l", String(next));
      try {
        localStorage.setItem("accent-l", String(next));
      } catch {}
    } catch {}
  });
  setCounter(0);
}
