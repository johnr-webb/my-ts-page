export function renderHomePage(appElement: HTMLElement) {
  const content = `
    <h1>Welcome to Housing Hunt</h1>
    <p>Your one-stop solution for finding and comparing apartments.</p>
    <p>Use the navigation bar to explore different features of the application.</p>
  `;
  appElement.innerHTML = content;
}
