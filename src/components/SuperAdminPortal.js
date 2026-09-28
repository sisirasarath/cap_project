/**
 * Super Admin Portal Component
 * Platform Governance, Interactive Chart.js Visualizations, Department Manager, and Scheme Catalog Editor.
 */

import { store } from '../store/stateManager.js';

export function renderSuperAdminPortal(container) {
  const { departments, grievances, schemes } = store;

  const totalComplaints = grievances.length;
  const resolvedComplaints = grievances.filter(g => g.status === 'Resolved').length;
  const criticalComplaints = grievances.filter(g => g.priority === 'Critical').length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100;

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Top Super Admin Header -->
      <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-3 py-1 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <i data-lucide="shield" class="w-3.5 h-3.5"></i> Super Admin Control Center
              </span>
              <span class="text-xs text-slate-400 font-mono">System Health: 99.8%</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              E-Governance Analytics & Platform Management
            </h2>
            <p class="text-sm text-slate-300 mt-1">
              Real-time monitoring of department performance, AI classification accuracy, and scheme distribution metrics.
            </p>
          </div>

          <!-- Quick Metric Badges -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
              <span class="text-xl font-black text-cyan-400 font-heading block">${totalComplaints}</span>
              <span class="text-[10px] text-slate-400">Total Filed</span>
            </div>
            <div class="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
              <span class="text-xl font-black text-emerald-400 font-heading block">${resolutionRate}%</span>
              <span class="text-[10px] text-slate-400">Resolution Rate</span>
            </div>
            <div class="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
              <span class="text-xl font-black text-rose-400 font-heading block">${criticalComplaints}</span>
              <span class="text-[10px] text-slate-400">Critical Priority</span>
            </div>
            <div class="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
              <span class="text-xl font-black text-amber-400 font-heading block">${schemes.length}</span>
              <span class="text-[10px] text-slate-400">Active Schemes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section (2 Columns) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Category Distribution Doughnut Chart (5 cols) -->
        <div class="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                <i data-lucide="pie-chart" class="w-4 h-4 text-cyan-400"></i>
                Category Volume Breakdown
              </h4>
              <p class="text-[11px] text-slate-400">Public Grievances grouped by NLP category</p>
            </div>
          </div>
          <div class="relative h-64 flex items-center justify-center">
            <canvas id="chart-category-doughnut"></canvas>
          </div>
        </div>

        <!-- Department Performance Bar Chart (7 cols) -->
        <div class="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                <i data-lucide="bar-chart-3" class="w-4 h-4 text-amber-400"></i>
                Department Performance Leaderboard
              </h4>
              <p class="text-[11px] text-slate-400">Total vs Resolved Grievances per Department</p>
            </div>
          </div>
          <div class="relative h-64">
            <canvas id="chart-dept-bar"></canvas>
          </div>
        </div>

      </div>

      <!-- Department Directory & SLA Settings Table -->
      <div class="glass-panel p-6 rounded-3xl border border-slate-800">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h4 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="building-2" class="w-5 h-5 text-indigo-400"></i>
              Government Departments Directory & SLA Manager
            </h4>
            <p class="text-xs text-slate-400">Manage nodal officers, SLA resolution timelines, and assigned categories.</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th class="p-3">Department Name</th>
                <th class="p-3">Code</th>
                <th class="p-3">Target Category</th>
                <th class="p-3">SLA Target</th>
                <th class="p-3">Nodal Officer</th>
                <th class="p-3">Grievance Count</th>
                <th class="p-3">Avg Resolution Time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${departments.map(d => `
                <tr class="hover:bg-slate-900/60 transition">
                  <td class="p-3 font-bold text-white">${d.name}</td>
                  <td class="p-3 font-mono text-cyan-400 font-semibold">${d.code}</td>
                  <td class="p-3"><span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">${d.category}</span></td>
                  <td class="p-3 font-bold text-amber-400">${d.slaHours} Hours</td>
                  <td class="p-3 text-slate-200">${d.nodalOfficer}</td>
                  <td class="p-3 font-semibold text-white">${d.totalGrievances}</td>
                  <td class="p-3 font-mono text-emerald-400">${d.avgResolutionHours}h</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Initialize Chart.js Visualizations asynchronously
  setTimeout(() => {
    initSuperAdminCharts(grievances, departments);
  }, 100);
}

/**
 * Initialize Chart.js Visualizations
 */
function initSuperAdminCharts(grievances, departments) {
  if (!window.Chart) return;

  // 1. Category Doughnut Chart
  const categoryCounts = {};
  grievances.forEach(g => {
    categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
  });

  const doughnutCtx = document.getElementById('chart-category-doughnut');
  if (doughnutCtx) {
    new window.Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categoryCounts),
        datasets: [{
          data: Object.values(categoryCounts),
          backgroundColor: [
            '#06b6d4', '#059669', '#d97706', '#e11d48',
            '#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b'
          ],
          borderWidth: 2,
          borderColor: '#0f172a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#cbd5e1', font: { size: 10 } }
          }
        }
      }
    });
  }

  // 2. Department Bar Chart
  const barCtx = document.getElementById('chart-dept-bar');
  if (barCtx) {
    new window.Chart(barCtx, {
      type: 'bar',
      data: {
        labels: departments.map(d => d.code),
        datasets: [
          {
            label: 'Total Grievances',
            data: departments.map(d => d.totalGrievances),
            backgroundColor: '#3b82f6'
          },
          {
            label: 'Resolved',
            data: departments.map(d => d.resolvedGrievances),
            backgroundColor: '#10b981'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
        },
        plugins: {
          legend: { labels: { color: '#cbd5e1', font: { size: 11 } } }
        }
      }
    });
  }
}
