/**
 * Main Header Component
 * Contains Logo, Title, Role Switcher, and Notification Bell
 */

import { store } from '../store/stateManager.js';

export function renderHeader(container) {
  const { currentRole, notifications } = store;
  const unreadCount = notifications.filter(n => !n.read).length;

  container.innerHTML = `
    <header class="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        <!-- Brand Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <i data-lucide="shield-check" class="w-7 h-7 text-white"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-extrabold font-heading tracking-tight text-white">JanSeva AI</h1>
              <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">e-Governance v2.4</span>
            </div>
            <p class="text-xs text-slate-400 font-medium hidden sm:block">AI Public Grievance Management & Scheme Recommendation Portal</p>
          </div>
        </div>

        <!-- Right Side: Role Selector & Notifications -->
        <div class="flex items-center gap-4">
          
          <!-- Role Switcher Segmented Control -->
          <div class="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
            <button id="role-btn-citizen" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${currentRole === 'citizen' ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}">
              <i data-lucide="user" class="w-3.5 h-3.5"></i>
              <span>Citizen</span>
            </button>
            <button id="role-btn-dept_admin" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${currentRole === 'dept_admin' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}">
              <i data-lucide="building-2" class="w-3.5 h-3.5"></i>
              <span>Dept Admin</span>
            </button>
            <button id="role-btn-super_admin" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${currentRole === 'super_admin' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}">
              <i data-lucide="shield" class="w-3.5 h-3.5"></i>
              <span>Super Admin</span>
            </button>
          </div>

          <!-- Notification Bell -->
          <div class="relative">
            <button id="notif-bell-btn" class="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition relative border border-slate-700/50">
              <i data-lucide="bell" class="w-5 h-5"></i>
              ${unreadCount > 0 ? `
                <span class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-md">
                  ${unreadCount}
                </span>
              ` : ''}
            </button>

            <!-- Notifications Popover -->
            <div id="notif-dropdown" class="hidden absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-4 z-50">
              <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <div class="flex items-center gap-2">
                  <i data-lucide="bell-ring" class="w-4 h-4 text-cyan-400"></i>
                  <h4 class="text-sm font-bold text-white">System Notifications</h4>
                </div>
                <button id="mark-read-btn" class="text-xs text-cyan-400 hover:underline">Mark all read</button>
              </div>
              <div class="max-h-64 overflow-y-auto divide-y divide-slate-800/60 my-2">
                ${notifications.map(n => `
                  <div class="py-2.5 px-2 hover:bg-slate-800/40 rounded-lg transition ${n.read ? 'opacity-70' : ''}">
                    <div class="flex items-start gap-2.5">
                      <div class="w-2 h-2 rounded-full mt-1.5 ${n.type === 'warning' ? 'bg-amber-400' : 'bg-cyan-400'}"></div>
                      <div>
                        <p class="text-xs text-slate-200 leading-snug">${n.text}</p>
                        <span class="text-[10px] text-slate-400 mt-1 block">${n.timestamp}</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

        </div>

      </div>
    </header>
  `;

  // Attach Event Listeners
  document.getElementById('role-btn-citizen').addEventListener('click', () => store.setRole('citizen'));
  document.getElementById('role-btn-dept_admin').addEventListener('click', () => store.setRole('dept_admin'));
  document.getElementById('role-btn-super_admin').addEventListener('click', () => store.setRole('super_admin'));

  const notifBtn = document.getElementById('notif-bell-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  const markReadBtn = document.getElementById('mark-read-btn');

  notifBtn.addEventListener('click', () => {
    notifDropdown.classList.toggle('hidden');
  });

  if (markReadBtn) {
    markReadBtn.addEventListener('click', () => {
      store.markNotificationsRead();
      notifDropdown.classList.add('hidden');
    });
  }

  // Re-initialize Lucide icons for header
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
