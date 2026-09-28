/**
 * Citizen Portal Component
 * Provides Grievance Filing with Live AI Triage, Trackers, and Scheme Eligibility Checker.
 */

import { store } from '../store/stateManager.js';
import { classifyGrievance } from '../aiEngine/categoryClassifier.js';
import { predictPriority } from '../aiEngine/priorityPredictor.js';
import { routeToDepartment } from '../aiEngine/departmentRouter.js';
import { recommendSchemes } from '../aiEngine/schemeRecommender.js';

let activeCitizenTab = 'file_grievance'; // 'file_grievance' | 'track_grievance' | 'scheme_checker' | 'profile'
let selectedTrackingId = null;

export function renderCitizenPortal(container) {
  const { currentCitizenProfile, grievances } = store;

  // If no tracking ID selected, select first grievance
  if (!selectedTrackingId && grievances.length > 0) {
    selectedTrackingId = grievances[0].id;
  }

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Top Citizen Hero Banner -->
      <div class="glass-panel p-6 sm:p-8 rounded-3xl mb-8 relative overflow-hidden border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 shadow-2xl">
        <div class="absolute -right-12 -top-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-3 py-1 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Citizen Dashboard</span>
              <span class="text-xs text-slate-400 font-medium">Welcome back, ${currentCitizenProfile.name}</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Intelligent Grievance & Scheme Portal
            </h2>
            <p class="text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Submit complaints with instant AI classification, track resolution status in real time, and discover government welfare programs tailored to your profile.
            </p>
          </div>

          <!-- Quick Stat Counters -->
          <div class="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div class="px-4 py-2 text-center border-r border-slate-800">
              <span class="text-xl font-black text-cyan-400 font-heading block">${grievances.length}</span>
              <span class="text-[10px] text-slate-400 font-medium">My Grievances</span>
            </div>
            <div class="px-4 py-2 text-center">
              <span class="text-xl font-black text-emerald-400 font-heading block">${grievances.filter(g => g.status === 'Resolved').length}</span>
              <span class="text-[10px] text-slate-400 font-medium">Resolved</span>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-800">
          <button id="tab-file_grievance" class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeCitizenTab === 'file_grievance' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'}">
            <i data-lucide="file-plus-2" class="w-4 h-4"></i>
            <span>File Grievance</span>
          </button>

          <button id="tab-track_grievance" class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeCitizenTab === 'track_grievance' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'}">
            <i data-lucide="line-chart" class="w-4 h-4"></i>
            <span>Track Complaints (${grievances.length})</span>
          </button>

          <button id="tab-scheme_checker" class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeCitizenTab === 'scheme_checker' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'}">
            <i data-lucide="gift" class="w-4 h-4"></i>
            <span>Scheme Eligibility Checker</span>
          </button>

          <button id="tab-profile" class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeCitizenTab === 'profile' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700'}">
            <i data-lucide="user-check" class="w-4 h-4"></i>
            <span>My Profile</span>
          </button>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div id="citizen-tab-content">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  // Attach tab switch events
  document.getElementById('tab-file_grievance').addEventListener('click', () => { activeCitizenTab = 'file_grievance'; renderCitizenPortal(container); });
  document.getElementById('tab-track_grievance').addEventListener('click', () => { activeCitizenTab = 'track_grievance'; renderCitizenPortal(container); });
  document.getElementById('tab-scheme_checker').addEventListener('click', () => { activeCitizenTab = 'scheme_checker'; renderCitizenPortal(container); });
  document.getElementById('tab-profile').addEventListener('click', () => { activeCitizenTab = 'profile'; renderCitizenPortal(container); });

  const tabContent = document.getElementById('citizen-tab-content');

  if (activeCitizenTab === 'file_grievance') {
    renderFileGrievanceTab(tabContent, container);
  } else if (activeCitizenTab === 'track_grievance') {
    renderTrackGrievanceTab(tabContent, container);
  } else if (activeCitizenTab === 'scheme_checker') {
    renderSchemeCheckerTab(tabContent);
  } else if (activeCitizenTab === 'profile') {
    renderProfileTab(tabContent);
  }

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Render File Grievance Tab with REAL-TIME NLP & AI Preview as citizen types!
 */
function renderFileGrievanceTab(tabContent, mainContainer) {
  const profile = store.currentCitizenProfile;

  tabContent.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Left Column: Grievance Submission Form (7 cols) -->
      <div class="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <i data-lucide="edit-3" class="w-5 h-5 text-cyan-400"></i>
              Grievance Filing Wizard
            </h3>
            <p class="text-xs text-slate-400">Fill in details below. Our AI engine will analyze your input in real time.</p>
          </div>
          <span class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live AI Parsing
          </span>
        </div>

        <form id="grievance-form" class="space-[#] space-y-5">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Grievance Subject / Title *</label>
            <input type="text" id="input-title" required placeholder="e.g. Broken water supply pipeline leaking on main street near hospital"
              class="w-full px-4 py-3 rounded-xl glass-input text-sm">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Grievance Description *</label>
            <textarea id="input-description" rows="5" required placeholder="Describe the issue, location details, exact emergency level, and impact..."
              class="w-full px-4 py-3 rounded-xl glass-input text-sm leading-relaxed"></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Estimated Affected Population *</label>
              <input type="number" id="input-affected" value="10" min="1" max="50000"
                class="w-full px-4 py-2.5 rounded-xl glass-input text-sm">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">District / Region *</label>
              <select id="input-district" class="w-full px-4 py-2.5 rounded-xl glass-input text-sm">
                <option value="Ernakulam" ${profile.district === 'Ernakulam' ? 'selected' : ''}>Ernakulam</option>
                <option value="Thiruvananthapuram" ${profile.district === 'Thiruvananthapuram' ? 'selected' : ''}>Thiruvananthapuram</option>
                <option value="Kozhikode" ${profile.district === 'Kozhikode' ? 'selected' : ''}>Kozhikode</option>
                <option value="Kottayam" ${profile.district === 'Kottayam' ? 'selected' : ''}>Kottayam</option>
                <option value="Palakkad" ${profile.district === 'Palakkad' ? 'selected' : ''}>Palakkad</option>
                <option value="Thrissur">Thrissur</option>
                <option value="Kannur">Kannur</option>
              </select>
            </div>
          </div>

          <button type="submit" class="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition transform active:scale-95 flex items-center justify-center gap-2">
            <i data-lucide="send" class="w-4 h-4"></i>
            <span>Submit Grievance to AI Engine</span>
          </button>
        </form>
      </div>

      <!-- Right Column: Live AI Real-Time Processing Engine Card (5 cols) -->
      <div class="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 to-slate-950 relative">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <i data-lucide="cpu" class="w-4 h-4 animate-spin"></i>
            </div>
            <div>
              <h4 class="text-sm font-extrabold text-white">AI Processing Engine</h4>
              <p class="text-[10px] text-cyan-400">NLP Vectorizer & Decision Matrix</p>
            </div>
          </div>
          <span class="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">BERT / TF-IDF Model</span>
        </div>

        <div id="ai-live-preview" class="space-y-4 my-4">
          <!-- Rendered live via JS on typing -->
          <div class="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center py-12">
            <i data-lucide="sparkles" class="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-50"></i>
            <p class="text-xs text-slate-400">Start typing your grievance title & description on the left to see real-time AI classification & department routing!</p>
          </div>
        </div>
      </div>

    </div>
  `;

  // Attach Real-Time Input Listeners for Live AI Triage Preview
  const titleInput = document.getElementById('input-title');
  const descInput = document.getElementById('input-description');
  const affectedInput = document.getElementById('input-affected');
  const previewBox = document.getElementById('ai-live-preview');

  function updateAiPreview() {
    const text = `${titleInput.value} ${descInput.value}`.trim();
    const affected = Number(affectedInput.value) || 1;

    if (!text || text.length < 5) {
      previewBox.innerHTML = `
        <div class="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center py-12">
          <i data-lucide="sparkles" class="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-50"></i>
          <p class="text-xs text-slate-400">Start typing your grievance title & description on the left to see real-time AI classification & department routing!</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // Run AI Engine Pipeline
    const classification = classifyGrievance(text);
    const priorityData = predictPriority({
      complaintText: text,
      category: classification.category,
      subcategory: classification.subcategory,
      affectedPeople: affected
    });
    const deptInfo = routeToDepartment(classification.category, classification.subcategory);
    const schemeMatches = recommendSchemes(store.currentCitizenProfile, {
      category: classification.category,
      subcategory: classification.subcategory
    }).slice(0, 2);

    previewBox.innerHTML = `
      <div class="space-y-4 animate-fade-in">
        
        <!-- Category & Subcategory Card -->
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">AI Category & Subcategory</span>
            <span class="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <i data-lucide="layers" class="w-4 h-4 text-cyan-400"></i>
              ${classification.category} &rarr; <span class="text-cyan-300 font-medium">${classification.subcategory}</span>
            </span>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-slate-400 font-mono block">Confidence</span>
            <span class="text-xs font-extrabold text-emerald-400">${Math.round(classification.confidence * 100)}%</span>
          </div>
        </div>

        <!-- Priority & Urgency Meter Card -->
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Predicted Priority Score</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${priorityData.badgeColor}">
              ${priorityData.priority.toUpperCase()} (${priorityData.score}/100)
            </span>
          </div>
          <div class="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div class="h-full rounded-full transition-all duration-500 ${priorityData.score > 80 ? 'bg-rose-500' : priorityData.score > 60 ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${priorityData.score}%"></div>
          </div>
        </div>

        <!-- Department Routing Card -->
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Automated Department Routing</span>
            <span class="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
              <i data-lucide="building-2" class="w-3.5 h-3.5 text-indigo-400"></i>
              ${deptInfo.name}
            </span>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-slate-400 block">SLA Target</span>
            <span class="text-xs font-bold text-amber-400">${deptInfo.slaHours} Hours</span>
          </div>
        </div>

        <!-- Scheme Recommendation Bonus Card -->
        <div class="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/30">
          <span class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
            <i data-lucide="gift" class="w-3 h-3 text-indigo-400"></i>
            Relevant Government Scheme Matches
          </span>
          <div class="space-y-1.5">
            ${schemeMatches.map(s => `
              <div class="flex items-center justify-between text-xs bg-slate-900/70 p-2 rounded-xl border border-indigo-500/20">
                <span class="font-medium text-white truncate max-w-[200px]">${s.name}</span>
                <span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">${s.matchScore}% Match</span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  titleInput.addEventListener('input', updateAiPreview);
  descInput.addEventListener('input', updateAiPreview);
  affectedInput.addEventListener('input', updateAiPreview);

  // Form Submission Event
  document.getElementById('grievance-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const affected = Number(affectedInput.value) || 1;
    const district = document.getElementById('input-district').value;

    const fullText = `${title} ${description}`;
    const classification = classifyGrievance(fullText);
    const priorityData = predictPriority({
      complaintText: fullText,
      category: classification.category,
      subcategory: classification.subcategory,
      affectedPeople: affected
    });
    const deptInfo = routeToDepartment(classification.category, classification.subcategory);
    const schemes = recommendSchemes(profile, { category: classification.category });

    const newId = `GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTrackingId = `KL-${Math.floor(1000 + Math.random() * 9000)}-${classification.category.slice(0,3).toUpperCase()}`;

    const newGrievance = {
      id: newId,
      trackingId: newTrackingId,
      citizenName: profile.name,
      citizenPhone: profile.phone,
      citizenEmail: profile.email,
      citizenDistrict: district,
      citizenPincode: profile.pincode,
      citizenIncome: profile.income,
      citizenAge: profile.age,
      citizenOccupation: profile.occupation,
      title,
      description,
      category: classification.category,
      subcategory: classification.subcategory,
      priority: priorityData.priority,
      priorityScore: priorityData.score,
      affectedPeople: affected,
      departmentId: deptInfo.departmentId,
      departmentName: deptInfo.name,
      nodalOfficer: deptInfo.nodalOfficer,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      slaTargetDate: deptInfo.slaTargetDate,
      timeline: [
        { status: 'Submitted', timestamp: new Date().toISOString(), note: 'Grievance submitted by citizen via web portal.' },
        { status: 'AI Triaged', timestamp: new Date().toISOString(), note: `AI System categorized as ${classification.category} -> ${classification.subcategory}. Priority: ${priorityData.priority.toUpperCase()} (${priorityData.score}/100). Auto-routed to ${deptInfo.name}.` }
      ],
      recommendedSchemes: schemes.slice(0, 2).map(s => s.name)
    };

    store.addGrievance(newGrievance);
    selectedTrackingId = newGrievance.id;
    activeCitizenTab = 'track_grievance';
    renderCitizenPortal(mainContainer);
  });
}

/**
 * Render Track Grievance Tab with Timeline & Status Workflow
 */
function renderTrackGrievanceTab(tabContent, mainContainer) {
  const grievances = store.grievances;

  if (grievances.length === 0) {
    tabContent.innerHTML = `
      <div class="glass-panel p-12 rounded-3xl text-center border border-slate-800">
        <i data-lucide="inbox" class="w-12 h-12 text-slate-500 mx-auto mb-3"></i>
        <h4 class="text-base font-bold text-white">No Grievances Filed Yet</h4>
        <p class="text-xs text-slate-400 mt-1">Submit your first complaint using the Grievance Filing Wizard above.</p>
      </div>
    `;
    return;
  }

  const selectedItem = grievances.find(g => g.id === selectedTrackingId || g.trackingId === selectedTrackingId) || grievances[0];

  tabContent.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Left Column: Grievances List (4 cols) -->
      <div class="lg:col-span-4 space-y-3">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Your Submitted Grievances</h4>
        <div class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          ${grievances.map(g => `
            <div id="grievance-item-${g.id}" class="p-4 rounded-2xl glass-card cursor-pointer ${g.id === selectedItem.id ? 'border-cyan-500/80 bg-slate-900/90 ring-1 ring-cyan-500/30' : 'border-slate-800/80'}">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-mono text-cyan-400 font-bold">#${g.trackingId}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${g.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : g.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}">
                  ${g.priority}
                </span>
              </div>
              <h5 class="text-xs font-bold text-white line-clamp-1">${g.title}</h5>
              <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                <span>${g.category}</span>
                <span class="font-semibold text-slate-300">${g.status}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right Column: Detail View & Real-Time Tracking Timeline (8 cols) -->
      <div class="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        
        <div class="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">Tracking ID: ${selectedItem.trackingId}</span>
              <span class="text-xs text-slate-400">${new Date(selectedItem.submittedAt).toLocaleDateString()}</span>
            </div>
            <h3 class="text-xl font-extrabold font-heading text-white mt-2">${selectedItem.title}</h3>
          </div>

          <div class="text-right">
            <span class="text-[10px] text-slate-400 block font-semibold">Current Resolution Status</span>
            <span class="inline-block px-3 py-1 text-xs font-extrabold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 mt-1">
              ${selectedItem.status}
            </span>
          </div>
        </div>

        <!-- Key Metadata Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 mb-8">
          <div>
            <span class="text-[10px] text-slate-400 block font-medium">Category / Sub</span>
            <span class="text-xs font-bold text-white">${selectedItem.category} &rarr; ${selectedItem.subcategory}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 block font-medium">AI Priority Score</span>
            <span class="text-xs font-bold text-rose-400">${selectedItem.priority.toUpperCase()} (${selectedItem.priorityScore}/100)</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 block font-medium">Assigned Department</span>
            <span class="text-xs font-bold text-indigo-300">${selectedItem.departmentName}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 block font-medium">Nodal Officer</span>
            <span class="text-xs font-bold text-slate-200">${selectedItem.nodalOfficer || 'Pending Assignment'}</span>
          </div>
        </div>

        <!-- Description Box -->
        <div class="mb-8">
          <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Complaint Description</h5>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-2xl border border-slate-800">${selectedItem.description}</p>
        </div>

        <!-- Workflow Resolution Timeline -->
        <div>
          <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Grievance Resolution Progress Timeline</h5>
          <div class="space-y-6 relative pl-6 border-l-2 border-slate-800 ml-2">
            ${selectedItem.timeline.map((step, idx) => `
              <div class="relative">
                <div class="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-cyan-500 ring-4 ring-slate-900 flex items-center justify-center">
                  <div class="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-white">${step.status}</span>
                    <span class="text-[10px] text-slate-400 font-mono">${new Date(step.timestamp).toLocaleString()}</span>
                  </div>
                  <p class="text-xs text-slate-300 mt-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">${step.note}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

    </div>
  `;

  // Attach selection listeners
  grievances.forEach(g => {
    const el = document.getElementById(`grievance-item-${g.id}`);
    if (el) {
      el.addEventListener('click', () => {
        selectedTrackingId = g.id;
        renderCitizenPortal(mainContainer);
      });
    }
  });
}

/**
 * Render Scheme Eligibility Checker Tab
 */
function renderSchemeCheckerTab(tabContent) {
  const profile = store.currentCitizenProfile;
  const recommended = recommendSchemes(profile);

  tabContent.innerHTML = `
    <div class="space-y-8">
      
      <!-- Top Profile Controls & Sliders -->
      <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <h3 class="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <i data-lucide="sliders" class="w-5 h-5 text-cyan-400"></i>
          Demographic & Financial Eligibility Input
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Annual Household Income (₹)</label>
            <input type="number" id="scheme-income" value="${profile.income}" step="10000" min="20000" max="1000000"
              class="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-semibold text-cyan-400">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Citizen Age (Years)</label>
            <input type="number" id="scheme-age" value="${profile.age}" min="1" max="100"
              class="w-full px-4 py-2.5 rounded-xl glass-input text-sm font-semibold">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Primary Occupation</label>
            <select id="scheme-occ" class="w-full px-4 py-2.5 rounded-xl glass-input text-sm">
              <option value="Farmer" ${profile.occupation === 'Farmer' ? 'selected' : ''}>Farmer</option>
              <option value="Laborer" ${profile.occupation === 'Laborer' ? 'selected' : ''}>Manual Laborer / Artisan</option>
              <option value="Student" ${profile.occupation === 'Student' ? 'selected' : ''}>Student</option>
              <option value="Unemployed" ${profile.occupation === 'Unemployed' ? 'selected' : ''}>Unemployed / Senior Citizen</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">District</label>
            <input type="text" value="${profile.district}" readonly class="w-full px-4 py-2.5 rounded-xl glass-input text-sm opacity-70">
          </div>
        </div>
      </div>

      <!-- Recommended Schemes Cards Grid -->
      <div>
        <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>AI Welfare Scheme Match Results (${recommended.length})</span>
          <span class="text-xs text-cyan-400 normal-case">Sorted by Match Compatibility</span>
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${recommended.map(scheme => `
            <div class="glass-card p-6 rounded-3xl flex flex-col justify-between border ${scheme.isEligible ? 'border-emerald-500/30' : 'border-slate-800'}">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[10px] font-bold px-2.5 py-1 rounded-full ${scheme.isEligible ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}">
                    ${scheme.isEligible ? 'Eligible Beneficiary' : 'Check Requirements'}
                  </span>
                  <span class="text-sm font-extrabold text-cyan-400 font-heading">${scheme.matchScore}% Match</span>
                </div>

                <h5 class="text-base font-extrabold font-heading text-white mb-2 leading-snug">${scheme.name}</h5>
                <span class="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 block w-max mb-3">${scheme.category}</span>
                <p class="text-xs text-slate-300 leading-relaxed mb-4">${scheme.description}</p>
                
                <div class="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-4">
                  <span class="text-[10px] text-slate-400 block font-semibold">Maximum Benefit Grant</span>
                  <span class="text-xs font-extrabold text-emerald-400">${scheme.maxFinancialBenefit}</span>
                </div>

                <!-- Match Reasons -->
                <div class="space-y-1 mb-4">
                  <span class="text-[10px] font-bold text-slate-400 uppercase">Match Criteria:</span>
                  ${scheme.matchReasons.map(r => `
                    <div class="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <i data-lucide="check-circle-2" class="w-3 h-3 text-emerald-400 flex-shrink-0"></i>
                      <span class="truncate">${r}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="pt-4 border-t border-slate-800/80">
                <a href="${scheme.officialPortalUrl}" target="_blank" class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition">
                  <span>Apply on Official Portal</span>
                  <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;

  // Attach profile update listeners
  const incEl = document.getElementById('scheme-income');
  const ageEl = document.getElementById('scheme-age');
  const occEl = document.getElementById('scheme-occ');

  const updateProfile = () => {
    store.updateCitizenProfile({
      income: Number(incEl.value) || profile.income,
      age: Number(ageEl.value) || profile.age,
      occupation: occEl.value
    });
    renderSchemeCheckerTab(tabContent);
    if (window.lucide) window.lucide.createIcons();
  };

  incEl.addEventListener('change', updateProfile);
  ageEl.addEventListener('change', updateProfile);
  occEl.addEventListener('change', updateProfile);
}

/**
 * Render Profile Tab
 */
function renderProfileTab(tabContent) {
  const profile = store.currentCitizenProfile;

  tabContent.innerHTML = `
    <div class="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border border-slate-800">
      <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <i data-lucide="user" class="w-5 h-5 text-cyan-400"></i>
        Citizen Profile Details
      </h3>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-slate-400 block mb-1">Full Name</label>
            <input type="text" id="prof-name" value="${profile.name}" class="w-full px-4 py-2.5 rounded-xl glass-input text-sm">
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Mobile Phone</label>
            <input type="text" id="prof-phone" value="${profile.phone}" class="w-full px-4 py-2.5 rounded-xl glass-input text-sm">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-slate-400 block mb-1">Email Address</label>
            <input type="email" id="prof-email" value="${profile.email}" class="w-full px-4 py-2.5 rounded-xl glass-input text-sm">
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">District</label>
            <input type="text" id="prof-dist" value="${profile.district}" class="w-full px-4 py-2.5 rounded-xl glass-input text-sm">
          </div>
        </div>

        <button id="save-profile-btn" class="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg mt-4 transition">
          Save Profile Changes
        </button>
      </div>
    </div>
  `;

  document.getElementById('save-profile-btn').addEventListener('click', () => {
    store.updateCitizenProfile({
      name: document.getElementById('prof-name').value,
      phone: document.getElementById('prof-phone').value,
      email: document.getElementById('prof-email').value,
      district: document.getElementById('prof-dist').value
    });
    alert('Citizen profile updated successfully!');
  });
}
