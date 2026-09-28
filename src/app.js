/**
 * Main Application Orchestrator
 * Bootstraps store subscriptions, header, portal role view, and footer.
 */

import { store } from './store/stateManager.js';
import { renderHeader } from './components/Header.js';
import { renderCitizenPortal } from './components/CitizenPortal.js';
import { renderDepartmentPortal } from './components/DepartmentPortal.js';
import { renderSuperAdminPortal } from './components/SuperAdminPortal.js';

function initApp() {
  const appContainer = document.getElementById('app');

  const render = () => {
    const { currentRole } = store;

    appContainer.innerHTML = `
      <!-- Top Sticky Header -->
      <div id="header-mount"></div>

      <!-- Main Portal Container -->
      <main id="portal-mount" class="flex-1 gradient-bg-main min-h-[calc(100vh-140px)]">
        <!-- Rendered based on role -->
      </main>

      <!-- Footer -->
      <footer class="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-300">JanSeva AI</span>
            <span>— Intelligent Public Grievance Management & Scheme Recommendation Platform</span>
          </div>
          <div class="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Powered by NLP & Machine Learning</span>
            <span>•</span>
            <a href="https://data.gov.in" target="_blank" class="hover:underline text-cyan-400">Open Data Integration</a>
          </div>
        </div>
      </footer>
    `;

    // Render Header
    renderHeader(document.getElementById('header-mount'));

    // Render Active Role View
    const portalMount = document.getElementById('portal-mount');
    if (currentRole === 'citizen') {
      renderCitizenPortal(portalMount);
    } else if (currentRole === 'dept_admin') {
      renderDepartmentPortal(portalMount);
    } else if (currentRole === 'super_admin') {
      renderSuperAdminPortal(portalMount);
    }
  };

  // Subscribe to store updates
  store.subscribe(render);

  // Initial render
  render();
}

// Start App when DOM ready
document.addEventListener('DOMContentLoaded', initApp);
