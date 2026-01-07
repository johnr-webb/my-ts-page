export function renderFindPage(appElement: HTMLElement) {
  const content = `
    <h1>Find Page</h1>
    <p>This is the Find page where you can search for locations.</p>
    <div>
      <h3>Search for a Location</h3>
      <input type="text" placeholder="Enter location..." />
      <button id="search-btn">Search</button>
    </div>
  `;

  appElement.innerHTML = content;

  const searchButton =
    document.querySelector<HTMLButtonElement>("#search-btn")!;
  searchButton.addEventListener("click", () => {
    // Implement search functionality here
    alert("Search functionality not implemented yet.");
  });
}
