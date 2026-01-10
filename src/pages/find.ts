export function renderFindPage(appElement: HTMLElement) {
  const content = `
    <h1>Find Page</h1>

    <p>
      🚧 This page is currently in the works.
    </p>

    <p>
      I'm working on it! Check back in a bit!
    </p>
  `;

  appElement.innerHTML = content;

  const searchButton =
    document.querySelector<HTMLButtonElement>("#search-btn")!;
  searchButton.addEventListener("click", () => {
    // Implement search functionality here
    alert("Search functionality not implemented yet.");
  });
}
