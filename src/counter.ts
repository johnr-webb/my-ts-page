export function setupCounter(element: HTMLButtonElement) {
  let counter = 0;
  const setCounter = (count: number) => {
    counter = count;
    element.innerHTML = `count is currently ${counter}`;
    if (counter >= 4) {
      element.style.backgroundColor = "lightgreen";
    } else if (counter >= 1) {
      element.style.backgroundColor = "green";
    } else {
      element.style.backgroundColor = "darkgreen";
    }
  };
  element.addEventListener("click", () => setCounter(counter + 1));
  setCounter(0);
}
