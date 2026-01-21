export function renderFindPage(appElement: HTMLElement) {
  const content = `
    <div class="page-container">
      <div class="page-content">
        <h1>Find New Page!</h1>
        <p>
          🚧 This page is currently in the works.
          I'm working on it! Check back in a bit!
        </p>
      </div>
    </div>
  `;

  appElement.innerHTML = content;

  const searchButton = document.querySelector<HTMLButtonElement>("#search-btn");
  searchButton?.addEventListener("click", () => {
    // Implement search functionality here
    alert("Search functionality not implemented yet.");
  });
}
