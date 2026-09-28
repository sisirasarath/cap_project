/**
 * Department Admin Portal Component
 * Prioritized Work Queue, Field Officer Assignment, Status Workflow, and Department SLA Metrics.
 */

import { store } from '../store/stateManager.js';

let selectedGrievanceIdForModal = null;

export function renderDepartmentPortal(container) {
  const { selectedDeptFilter, departments, grievances } = store;

  // Find active department object
  const activeDept = departments.find(d => d.id === selectedDeptFilter) || departments[0];

  // Filter grievances assigned to this department
  const deptGrievances = grievances.filter(g => g.departmentId === activeDept.id || g.category === activeDept.category);

  // Sort by AI Priority Score descending (Critical/High first)
  const sortedQueue = [...deptGrievances].sort((a, b) => b.priorityScore - a.priorityScore);

  const pendingCount = sortedQueue.filter(g => g.status !== 'Resolved').length;
  const criticalCount = sortedQueue.filter(g => g.priority === 'Critical').length;
  const resolvedCount = sortedQueue.filter(g => g.status === 'Resolved').length;

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Top Department Header & Switcher -->
      <div class="glass-panel p-6 sm:p-8 rounded-3xl mb-8 border border-amber-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <i data-lucide="building-2" class="w-3.5 h-3.5"></i> Department Admin Portal
              </span>
              <span class="text-xs text-slate-400 font-mono">SLA Target: ${activeDept.slaHours} Hours</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              ${activeDept.name}
            </h2>
            <p class="text-sm text-slate-300 mt-1">
              AI-Prioritized Work Queue • Nodal Officer: <span class="text-amber-300 font-semibold">${activeDept.nodalOfficer}</span>
            </p>
          </div>

          <!-- Department Switcher Dropdown & Quick Stats -->
          <div class="flex flex-wrap items-center gap-4">
            <div>
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Switch Department View</label>
              <select id="dept-selector" class="px-4 py-2.5 rounded-xl glass-input text-xs font-bold text-amber-300 bg-slate-950 border-amber-500/30">
                ${departments.map(d => `
                  <option value="${d.id}" ${d.id === activeDept.id ? 'selected' : ''}>${d.name} (${d.code})</option>
                `).join('')}
              </select>
            </div>

            <div class="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
              <div class="px-3 py-1 text-center border-r border-slate-800">
                <span class="text-lg font-black text-rose-400 font-heading block">${criticalCount}</span>
                <span class="text-[9px] text-slate-400">Critical</span>
              </div>
              <div class="px-3 py-1 text-center border-r border-slate-800">
                <span class="text-lg font-black text-amber-400 font-heading block">${pendingCount}</span>
                <span class="text-[9px] text-slate-400">Pending</span>
              </div>
              <div class="px-3 py-1 text-center">
                <span class="text-lg font-black text-emerald-400 font-heading block">${resolvedCount}</span>
                <span class="text-[9px] text-slate-400">Resolved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Work Queue Table -->
      <div class="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        
        <div class="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i data-lucide="list-ordered" class="w-5 h-5 text-amber-400"></i>
              AI Priority-Sorted Queue (${sortedQueue.length} Complaints)
            </h3>
            <p class="text-xs text-slate-400">Sorted automatically by AI severity score, safety risk, and SLA deadline.</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th class="p-4">AI Priority & Score</th>
                <th class="p-4">Tracking ID & Subject</th>
                <th class="p-4">Subcategory</th>
                <th class="p-4">Citizen & Location</th>
                <th class="p-4">Status</th>
                <th class="p-4">Assigned Field Officer</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${sortedQueue.length === 0 ? `
                <tr>
                  <td colspan="7" class="p-12 text-center text-slate-500">
                    <i data-lucide="check-circle" class="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-50"></i>
                    No grievances currently assigned to this department!
                  </td>
                </tr>
              ` : sortedQueue.map(item => `
                <tr class="hover:bg-slate-900/60 transition">
                  <!-- Priority Badge -->
                  <td class="p-4 whitespace-nowrap">
                    <span class="px-3 py-1 rounded-full font-bold text-[11px] ${item.priority === 'Critical' ? 'bg-rose-600 text-white border border-rose-500 shadow-md shadow-rose-600/30 animate-pulse' : item.priority === 'High' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'}">
                      ${item.priority.toUpperCase()} (${item.priorityScore})
                    </span>
                  </td>

                  <!-- Tracking ID & Title -->
                  <td class="p-4">
                    <span class="text-[10px] font-mono text-cyan-400 font-bold block">#${item.trackingId}</span>
                    <span class="text-xs font-bold text-white line-clamp-1 max-w-xs">${item.title}</span>
                  </td>

                  <!-- Subcategory -->
                  <td class="p-4 whitespace-nowrap">
                    <span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-700">${item.subcategory}</span>
                  </td>

                  <!-- Citizen & Location -->
                  <td class="p-4 whitespace-nowrap">
                    <span class="text-xs font-semibold text-slate-200 block">${item.citizenName}</span>
                    <span class="text-[10px] text-slate-400">${item.citizenDistrict}</span>
                  </td>

                  <!-- Status -->
                  <td class="p-4 whitespace-nowrap">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${item.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : item.status === 'In Progress' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'}">
                      ${item.status}
                    </span>
                  </td>

                  <!-- Assigned Field Officer -->
                  <td class="p-4 whitespace-nowrap text-xs text-slate-300">
                    ${item.nodalOfficer || 'Unassigned'}
                  </td>

                  <!-- Action Button -->
                  <td class="p-4 text-right whitespace-nowrap">
                    <button id="dept-action-btn-${item.id}" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1 ml-auto">
                      <i data-lucide="sliders" class="w-3.5 h-3.5"></i>
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Action Modal Overlay (Rendered dynamically if selected) -->
      <div id="dept-modal-container"></div>
    </div>
  `;

  // Attach Department Switcher Event
  document.getElementById('dept-selector').addEventListener('change', (e) => {
    store.setDeptFilter(e.target.value);
    renderDepartmentPortal(container);
  });

  // Attach Action Modal Listeners
  sortedQueue.forEach(item => {
    const btn = document.getElementById(`dept-action-btn-${item.id}`);
    if (btn) {
      btn.addEventListener('click', () => {
        openDeptModal(item, activeDept, container);
      });
    }
  });

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Render Department Action Modal
 */
function openDeptModal(grievance, activeDept, mainContainer) {
  const modalContainer = document.getElementById('dept-modal-container');
  
  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div class="glass-panel w-full max-w-2xl p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span class="text-xs font-mono font-bold text-amber-400">Complaint #${grievance.trackingId}</span>
            <h4 class="text-lg font-bold text-white mt-1">${grievance.title}</h4>
          </div>
          <button id="close-modal-btn" class="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Complaint Info Box -->
        <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <div class="flex justify-between text-slate-400">
            <span>Category: <strong class="text-white">${grievance.category} &rarr; ${grievance.subcategory}</strong></span>
            <span>Priority Score: <strong class="text-rose-400">${grievance.priority.toUpperCase()} (${grievance.priorityScore}/100)</strong></span>
          </div>
          <p class="text-slate-300 bg-slate-900 p-3 rounded-xl">${grievance.description}</p>
        </div>

        <!-- Workflow Update Form -->
        <form id="dept-update-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Update Status Workflow stage</label>
            <select id="modal-status" class="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-bold text-white bg-slate-950">
              <option value="Submitted" ${grievance.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
              <option value="In Review" ${grievance.status === 'In Review' ? 'selected' : ''}>In Review</option>
              <option value="Field Inspection" ${grievance.status === 'Field Inspection' ? 'selected' : ''}>Field Inspection Dispatched</option>
              <option value="In Progress" ${grievance.status === 'In Progress' ? 'selected' : ''}>Work In Progress</option>
              <option value="Resolved" ${grievance.status === 'Resolved' ? 'selected' : ''}>Resolved & Closed</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Assign Field Officer</label>
            <select id="modal-officer" class="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white bg-slate-950">
              ${activeDept.fieldOfficers.map(off => `
                <option value="${off.name} (${off.designation})" ${grievance.nodalOfficer?.includes(off.name) ? 'selected' : ''}>
                  ${off.name} — ${off.designation}
                </option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Official Resolution Action Note / Field Log</label>
            <textarea id="modal-note" rows="3" required placeholder="Enter inspection notes, work order reference, or resolution summary..."
              class="w-full px-4 py-2.5 rounded-xl glass-input text-xs leading-relaxed"></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" id="cancel-modal-btn" class="px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700">Cancel</button>
            <button type="submit" class="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg">Save & Update Workflow</button>
          </div>
        </form>

      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-modal-btn');
  const form = document.getElementById('dept-update-form');

  const closeModal = () => {
    modalContainer.innerHTML = '';
  };

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newStatus = document.getElementById('modal-status').value;
    const officer = document.getElementById('modal-officer').value;
    const note = document.getElementById('modal-note').value;

    store.updateGrievanceStatus(grievance.id, newStatus, note, officer);
    closeModal();
    renderDepartmentPortal(mainContainer);
  });
}
