import { navigateTo } from '../router';

export function renderFindPage(appElement: HTMLElement) {
  const content = `
    <div class="page-container">
      <div class="page-content">
        <div class="coming-soon">
          <h1>Find New Apartments</h1>
          <p>This feature is coming soon!</p>
          <p>In the meantime, use the <strong>Compare Apartments</strong> feature to manually add and compare properties you find on Zillow, RedFin, or other rental sites.</p>
          
          <div class="coming-soon-actions">
            <button class="btn btn-primary" data-action="compare">
              Start Comparing
            </button>
            <button class="btn btn-secondary" data-action="home">
              Back to Home
            </button>
          </div>
          
          <div class="how-it-works">
            <h3>How to Compare Currently:</h3>
            <ol>
              <li>Browse Zillow, RedFin, or your favorite rental site</li>
              <li>Find properties you're interested in</li>
              <li>Use "Compare Apartments" to add them manually</li>
              <li>Get detailed comparisons and make informed decisions</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `;

  appElement.innerHTML = content;
  setupEventListeners();
}

function setupEventListeners() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const action = target.closest('button')?.dataset.action;
    
    if (action === 'compare') {
      navigateTo('/compare');
    } else if (action === 'home') {
      navigateTo('/');
    }
  });
}
