const BASE = 'http://localhost/publicwatchnew/backend/api';

export const api = {
  // Auth
  register: (data) => fetch(`${BASE}/auth.php?action=register`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  login: (data) => fetch(`${BASE}/auth.php?action=login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),

  // Complaints
  getFeed: (page=1) => fetch(`${BASE}/complaints.php?action=feed&page=${page}`).then(r => r.json()),
  getComplaint: (id) => fetch(`${BASE}/complaints.php?action=single&id=${id}`).then(r => r.json()),
  getMyComplaints: (userId) => fetch(`${BASE}/complaints.php?action=my_complaints&user_id=${userId}`).then(r => r.json()),
  submitComplaint: (formData) => fetch(`${BASE}/complaints.php?action=create`, { method: 'POST', body: formData }).then(r => r.json()),
  upvote: (data) => fetch(`${BASE}/complaints.php?action=upvote`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  addComment: (data) => fetch(`${BASE}/complaints.php?action=comment`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  escalate: (data) => fetch(`${BASE}/complaints.php?action=escalate`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  checkUpvote: (cid, uid) => fetch(`${BASE}/complaints.php?action=check_upvote&complaint_id=${cid}&user_id=${uid}`).then(r => r.json()),

  // Gov
  govRegister: (data) => fetch(`${BASE}/authority.php?action=register`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  govLogin: (data) => fetch(`${BASE}/authority.php?action=login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  getWorkers: (dept) => fetch(`${BASE}/authority.php?action=workers&department=${encodeURIComponent(dept)}`).then(r => r.json()),
  getWorkerById: (id, dept) => fetch(`${BASE}/authority.php?action=worker_by_id&worker_id=${id}&department=${encodeURIComponent(dept)}`).then(r => r.json()),
  addWorker: (data) => fetch(`${BASE}/authority.php?action=add_worker`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  deleteWorker: (id) => fetch(`${BASE}/authority.php?action=delete_worker&worker_id=${id}`, { method: 'DELETE' }).then(r => r.json()),
  getGovComplaints: (dept, status='') => fetch(`${BASE}/complaints.php?action=gov_list&department=${encodeURIComponent(dept)}&status=${encodeURIComponent(status)}`).then(r => r.json()),
  assignWorker: (data) => fetch(`${BASE}/complaints.php?action=assign`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  updateStatus: (data) => fetch(`${BASE}/complaints.php?action=update_status`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  getStats: (dept) => fetch(`${BASE}/complaints.php?action=stats&department=${encodeURIComponent(dept)}`).then(r => r.json()),
  getNotifications: (uid) => fetch(`${BASE}/authority.php?action=notifications&user_id=${uid}`).then(r => r.json()),
  markNotificationsRead: (uid) => fetch(`${BASE}/authority.php?action=mark_read`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({user_id: uid}) }).then(r => r.json()),
};

export const UPLOAD_BASE = 'http://localhost/publicwatchnew/backend';
export const DEPARTMENTS = [
  'Property Tax','Birth and death','Health/Sanitation Department','PWD Department',
  'Water Tax','Fire brigade department','Establishment department','Town planning',
  'NULM DEPARTMENT/Hawker policy department/General Administrative','Environment',
  'Library','Atikraman','IT','Construction','Water supply','Electricity',
  'Transport/Vehicle','Advertisement tax department','Women welfare',
  'Medical Health','sports department','Specially abled welfare department'
];

export const PRABHAGS = [
  'HeadQuarters(HQ)/मुख्यालय','Bolinj(Ward A)/बोलिंज (प्रभाग ए)',
  'Virar(Ward B)/विरार (प्रभाग बी)','Chandansar(Ward C)/चंदनसर (प्रभाग सी)',
  'Achole (ward D)/अचोले (प्रभाग डी)','Nallasopara(ward E)/नालासोपारा (प्रभाग E)',
  'Pelhar/Dhanivbaug(ward F)/पेल्हार/धनुवबाग (वार्ड एफ)','Valiv(ward G)/वालिव(प्रभाग जी)',
  'Vasai Navghar(ward H)/वसई नवघर (प्रभाग एच)','Vasai gaon(ward I)/वसई गांव (प्रभाग I)'
];

export const COMPLAINT_TYPES = {
  'Property Tax': ['Property Tax Assessment','Property Tax Waiver','Duplicate Bill','New Connection'],
  'Birth and death': ['Birth Certificate','Death Certificate','Name Correction','Record Not Found'],
  'Health/Sanitation Department': ['Garbage Collection','Drainage Blockage','Mosquito Menace','Sanitation Issues','Illegal Dumping'],
  'PWD Department': ['Pothole','Road Damage','Street Light','Footpath','Encroachment on Road'],
  'Water Tax': ['Water Tax Bill','New Connection','Excess Billing','Meter Issue'],
  'Fire brigade department': ['Fire Hazard','Emergency','Equipment Failure','Training Request'],
  'Establishment department': ['Staff Complaint','Service Issue','Document Request','Other'],
  'Town planning': ['Illegal Construction','Plan Approval','Layout Issue','Building Violation'],
  'NULM DEPARTMENT/Hawker policy department/General Administrative': ['Hawker Zone','Vendor License','Street Vending','General Query'],
  'Environment': ['Tree Cutting','Pollution','Open Burning','Environmental Hazard'],
  'Library': ['Book Missing','Facility Issue','Membership','Other'],
  'Atikraman': ['Encroachment','Unauthorized Construction','Land Dispute','Other'],
  'IT': ['Website Issue','Software Bug','Data Error','Technical Support'],
  'Construction': ['Road Work','Building Work','Quality Issue','Delayed Work'],
  'Water supply': ['No Water Supply','Low Pressure','Pipe Leakage','Water Quality'],
  'Electricity': ['Power Outage','Electrical Hazard','Meter Issue','Street Light'],
  'Transport/Vehicle': ['Vehicle Breakdown','Route Issue','Fare Problem','Schedule Issue'],
  'Advertisement tax department': ['Billboard Issue','License','Tax Issue','Other'],
  'Women welfare': ['Safety Concern','Scheme Inquiry','Complaint','Other'],
  'Medical Health': ['Healthcare Facility','Medicine Shortage','Doctor Issue','Other'],
  'sports department': ['Ground Maintenance','Equipment','Booking Issue','Other'],
  'Specially abled welfare department': ['Accessibility Issue','Scheme Inquiry','Complaint','Other']
};
