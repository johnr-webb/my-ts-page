export function renderHomePage(contentElement: HTMLElement) {
  const content = `
    <div class="page-container">
      <div class="page-content">
        <h1>Welcome to Housing Hunt</h1>
        <p>Your one-stop solution for finding and comparing apartments.</p>
        <p>Use the navigation bar to explore different features of the application. Hello I am testing</p>
      </div>
    </div>
  `;
  contentElement.innerHTML = content;
}
