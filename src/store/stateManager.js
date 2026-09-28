/**
 * Global Reactive State Store v2.0
 * Includes Authentication State, Scheme Applications Queue, and Event Listeners
 */

import { INITIAL_GRIEVANCES } from '../data/sampleGrievances.js';
import { INITIAL_DEPARTMENTS } from '../data/sampleDepartments.js';
import { GOVERNMENT_SCHEMES } from '../aiEngine/schemeRecommender.js';

export const INITIAL_SCHEME_APPLICATIONS = [
  {
    appId: 'APP-2026-1092',
    schemeId: 'SCHEME-CMDRF',
    schemeName: "Chief Minister's Distress Relief Fund (CMDRF)",
    citizenName: 'Ramesh Varma',
    citizenPhone: '+91 98470 12345',
    citizenIncome: 120000,
    citizenAge: 54,
    citizenOccupation: 'Laborer',
    district: 'Ernakulam',
    requestedGrantAmount: '₹1,50,000',
    attachedDocs: ['Income Certificate (Certified)', 'Hospital Dialysis Summary', 'Aadhaar Card'],
    status: 'Under Verification',
    submittedAt: '2026-08-04T11:00:00.000Z',
    remarks: 'Awaiting Village Officer income verification report.'
  },
  {
    appId: 'APP-2026-1184',
    schemeId: 'SCHEME-PM-KISAN',
    schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    citizenName: 'K. P. Mohammed',
    citizenPhone: '+91 98952 54321',
    citizenIncome: 95000,
    citizenAge: 61,
    citizenOccupation: 'Farmer',
    district: 'Kozhikode',
    requestedGrantAmount: '₹6,000 / year direct transfer',
    attachedDocs: ['Land Holding Rights Pattayam', 'Kisan Credit Card', 'Aadhaar-Seeded Bank Passbook'],
    status: 'Submitted',
    submittedAt: '2026-08-05T09:30:00.000Z',
    remarks: 'New application submitted via Citizen Scheme Eligibility module.'
  }
];

class StateStore {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.selectedDeptFilter = 'DEPT-KSEB';
    this.currentCitizenProfile = {
      name: 'Ramesh Varma', email: 'ramesh.varma@email.com', phone: '+91 98470 12345',
      district: 'Ernakulam', pincode: '682011', income: 120000, age: 54, occupation: 'Laborer'
    };

    this.grievances = this.loadFromStorage('cap_grievances_v2', INITIAL_GRIEVANCES);
    this.schemeApplications = this.loadFromStorage('cap_scheme_apps_v2', INITIAL_SCHEME_APPLICATIONS);
    this.departments = this.loadFromStorage('cap_departments_v2', INITIAL_DEPARTMENTS);
    this.schemes = this.loadFromStorage('cap_schemes_v2', GOVERNMENT_SCHEMES);
    this.listeners = [];
  }

  loadFromStorage(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) { return fallback; }
  }

  saveToStorage(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  notify() { this.listeners.forEach(fn => fn(this)); }

  login(role, userDetails) {
    this.isAuthenticated = true;
    this.currentUser = { role, ...userDetails };
    if (role === 'dept_admin' && userDetails.deptId) {
      this.selectedDeptFilter = userDetails.deptId;
    }
    this.notify();
  }

  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.notify();
  }

  setDeptFilter(deptId) { this.selectedDeptFilter = deptId; this.notify(); }
  updateCitizenProfile(p) { this.currentCitizenProfile = { ...this.currentCitizenProfile, ...p }; this.notify(); }

  addGrievance(g) {
    this.grievances = [g, ...this.grievances];
    this.saveToStorage('cap_grievances_v2', this.grievances);
    this.notify();
  }

  updateGrievanceStatus(id, newStatus, note = '', assignedOfficer = null) {
    this.grievances = this.grievances.map(g => {
      if (g.id === id || g.trackingId === id) {
        const updatedTimeline = [...(g.timeline || []), { status: newStatus, timestamp: new Date().toISOString(), note: note || `Status updated to ${newStatus}` }];
        return { ...g, status: newStatus, nodalOfficer: assignedOfficer || g.nodalOfficer, timeline: updatedTimeline };
      }
      return g;
    });
    this.saveToStorage('cap_grievances_v2', this.grievances);
    this.notify();
  }

  applyForScheme(schemeData) {
    const newApp = {
      appId: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      schemeId: schemeData.id,
      schemeName: schemeData.name,
      citizenName: this.currentCitizenProfile.name,
      citizenPhone: this.currentCitizenProfile.phone,
      citizenIncome: this.currentCitizenProfile.income,
      citizenAge: this.currentCitizenProfile.age,
      citizenOccupation: this.currentCitizenProfile.occupation,
      district: this.currentCitizenProfile.district,
      requestedGrantAmount: schemeData.maxFinancialBenefit,
      attachedDocs: ['Income Certificate', 'Aadhaar Card', 'BPL Ration Card'],
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      remarks: 'New application filed by citizen.'
    };
    this.schemeApplications = [newApp, ...this.schemeApplications];
    this.saveToStorage('cap_scheme_apps_v2', this.schemeApplications);
    this.notify();
  }

  updateSchemeAppStatus(appId, newStatus, remarks = '') {
    this.schemeApplications = this.schemeApplications.map(app => {
      if (app.appId === appId) {
        return { ...app, status: newStatus, remarks: remarks || app.remarks };
      }
      return app;
    });
    this.saveToStorage('cap_scheme_apps_v2', this.schemeApplications);
    this.notify();
  }
}

export const store = new StateStore();
