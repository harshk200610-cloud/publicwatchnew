export const BASE = 'http://localhost/publicwatch/backend/api';

export const DEPARTMENTS = [
  'Property Tax','Birth and death','Health/Sanitation Department','PWD Department',
  'Water Tax','Fire brigade department','Establishment department','Town planning',
  'NULM DEPARTMENT/Hawker policy department/General Administrative','Environment',
  'Library','Atikraman','IT','Construction','Water supply','Electricity',
  'Transport/Vehicle','Advertisement tax department','Women welfare',
  'Medical Health','sports department','Specially abled welfare department'
];

export const govApi = {
  getComplaints: (dept, status = '') =>
    fetch(`${BASE}/complaints.php?action=gov_list&department=${encodeURIComponent(dept)}&status=${encodeURIComponent(status)}`).then(r => r.json()),

  getStats: (dept) =>
    fetch(`${BASE}/complaints.php?action=stats&department=${encodeURIComponent(dept)}`).then(r => r.json()),

  getWorkers: (dept) =>
    fetch(`${BASE}/authority.php?action=workers&department=${encodeURIComponent(dept)}`).then(r => r.json()),

  getWorkerById: (worker_id, dept) =>
    fetch(`${BASE}/authority.php?action=worker_by_id&worker_id=${worker_id}&department=${encodeURIComponent(dept)}`).then(r => r.json()),

  assign: (data) =>
    fetch(`${BASE}/complaints.php?action=assign`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(r => r.json()),

  updateStatus: (data) =>
    fetch(`${BASE}/complaints.php?action=update_status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(r => r.json()),

  addWorker: (data) =>
    fetch(`${BASE}/authority.php?action=add_worker`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(r => r.json()),

  deleteWorker: (worker_id) =>
    fetch(`${BASE}/authority.php?action=delete_worker&worker_id=${worker_id}`, { method: 'DELETE' }).then(r => r.json()),
};
