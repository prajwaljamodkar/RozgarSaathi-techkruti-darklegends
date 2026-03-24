/**
 * RozgarSaathi Backend
 * Pure Node.js — no external dependencies required.
 * Data is stored in JSON files (data/jobs.json, data/workers.json).
 *
 * Start:  node server.js
 * Port:   8080  (override with PORT env var)
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

// ─── Config ──────────────────────────────────────────────────────────────────
const PORT     = process.env.PORT || 8080;
const DATA_DIR = path.join(__dirname, 'data');

// ─── Ensure data directory exists ────────────────────────────────────────────
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── Simple JSON file-based store ────────────────────────────────────────────
function readStore(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return []; }
}

function writeStore(name, data) {
  const file = path.join(DATA_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Seed demo data on first run ─────────────────────────────────────────────
function seedIfEmpty() {
  const jobs = readStore('jobs');
  if (jobs.length === 0) {
    const demo = [
      {
        id: generateId(), title: 'Pipe leakage repair — kitchen & bathroom',
        skillRequired: 'plumber', pay: '₹600/day',
        description: '2 leaking pipes under sink and in bathroom. Must bring own tools. Same-day work, 2–3 hours expected.',
        area: 'Sion West, Mumbai', posterName: 'Ramesh K.', posterPhone: '9876500001',
        workDate: today(), urgent: true, createdAt: new Date().toISOString()
      },
      {
        id: generateId(), title: 'Full wiring — new 2BHK flat, Chembur',
        skillRequired: 'electrician', pay: '₹800/day',
        description: 'Complete internal wiring for new construction 2BHK. Must know switchboard fitting and MCB setup.',
        area: 'Chembur East, Mumbai', posterName: 'Suresh Contractors', posterPhone: '9876500002',
        workDate: today(), createdAt: new Date().toISOString()
      },
      {
        id: generateId(), title: '3BHK interior painting, 2 coats Asian Paints',
        skillRequired: 'painter', pay: '₹650/day',
        description: 'Full flat painting — 3 bedroom, hall, kitchen. Paint & material supplied by owner. Experienced painter only.',
        area: 'Kurla West, Mumbai', posterName: 'Mehta Family', posterPhone: '9876500003',
        workDate: today(), createdAt: new Date().toISOString()
      },
      {
        id: generateId(), title: 'Office furniture loading/unloading & shifting',
        skillRequired: 'mazdoor', pay: '₹450/day',
        description: 'Office relocation — heavy furniture, boxes. Half-day job starting 8 AM. Need 3 people.',
        area: 'Andheri West, Mumbai', posterName: 'Move-It Logistics', posterPhone: '9876500004',
        workDate: today(), createdAt: new Date().toISOString()
      },
      {
        id: generateId(), title: 'Modular kitchen cabinet assembly & fitting',
        skillRequired: 'carpenter', pay: '₹700/day',
        description: 'Pre-manufactured units to assemble and wall-fix. Holes pre-drilled. Experienced carpenter only.',
        area: 'Bandra East, Mumbai', posterName: 'Home Reno Co.', posterPhone: '9876500005',
        workDate: today(), createdAt: new Date().toISOString()
      },
      {
        id: generateId(), title: 'Bathroom tiling — 60×60 vitrified tiles, full room',
        skillRequired: 'tile', pay: '₹750/day',
        description: 'Floor + wall tiling for full bathroom. Tiles and adhesive supplied. Grout work included.',
        area: 'Ghatkopar West, Mumbai', posterName: 'Raj Construction', posterPhone: '9876500006',
        workDate: today(), createdAt: new Date().toISOString()
      }
    ];
    writeStore('jobs', demo);
    console.log('✅ Seeded 6 demo jobs');
  }

  const workers = readStore('workers');
  if (workers.length === 0) {
    const demo = [
      {
        id: generateId(), name: 'Mohan Yadav', phone: '9876501001',
        skill: 'plumber', area: 'Sion, Mumbai', ratePerDay: 550,
        availableToday: true, verified: true, rating: 4.8, jobsCompleted: 34,
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(), name: 'Dinesh Kumar', phone: '9876501002',
        skill: 'electrician', area: 'Kurla, Mumbai', ratePerDay: 700,
        availableToday: true, verified: true, rating: 4.9, jobsCompleted: 61,
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(), name: 'Sanjay Rathore', phone: '9876501003',
        skill: 'painter', area: 'Chembur, Mumbai', ratePerDay: 600,
        availableToday: false, verified: true, rating: 4.7, jobsCompleted: 22,
        createdAt: new Date().toISOString()
      }
    ];
    writeStore('workers', demo);
    console.log('✅ Seeded 3 demo workers');
  }
}

function today() { return new Date().toISOString().slice(0, 10); }

// ─── Validation helpers ───────────────────────────────────────────────────────
function validateJob(body) {
  const errors = [];
  if (!body.title || body.title.trim().length < 3)
    errors.push('title is required (min 3 chars)');
  if (!body.skillRequired)
    errors.push('skillRequired is required');
  if (!body.posterPhone || !/^\d{10}$/.test(body.posterPhone.trim()))
    errors.push('posterPhone must be a 10-digit mobile number');
  return errors;
}

function validateWorker(body) {
  const errors = [];
  if (!body.name || body.name.trim().length < 2)
    errors.push('name is required (min 2 chars)');
  if (!body.phone || !/^\d{10}$/.test(body.phone.trim()))
    errors.push('phone must be a 10-digit mobile number');
  if (!body.skill)
    errors.push('skill is required');
  return errors;
}

// ─── Request body parser ──────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; if (raw.length > 1e6) reject(new Error('Payload too large')); });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

// ─── Response helpers ─────────────────────────────────────────────────────────
function sendJSON(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type':  'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(body);
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ─── Route handlers ───────────────────────────────────────────────────────────

/* GET /api/jobs?skill=plumber&area=Sion&date=2025-06-01&limit=20&page=1 */
function handleGetJobs(req, res) {
  const q      = url.parse(req.url, true).query;
  let jobs = readStore('jobs');

  // Filter
  if (q.skill)  jobs = jobs.filter(j => j.skillRequired === q.skill);
  if (q.area)   jobs = jobs.filter(j => j.area && j.area.toLowerCase().includes(q.area.toLowerCase()));
  if (q.date)   jobs = jobs.filter(j => j.workDate === q.date);
  if (q.urgent) jobs = jobs.filter(j => j.urgent === true);

  // Sort — newest first
  jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const limit = Math.min(parseInt(q.limit) || 50, 100);
  const page  = Math.max(parseInt(q.page)  || 1,   1);
  const total = jobs.length;
  const start = (page - 1) * limit;
  const paged = jobs.slice(start, start + limit);

  sendJSON(res, 200, {
    jobs: paged,
    meta: { total, page, limit, pages: Math.ceil(total / limit) }
  });
}

/* POST /api/jobs */
async function handlePostJob(req, res) {
  let body;
  try { body = await readBody(req); }
  catch (e) { return sendJSON(res, 400, { error: e.message }); }

  const errors = validateJob(body);
  if (errors.length) return sendJSON(res, 422, { errors });

  const jobs = readStore('jobs');
  const job  = {
    id:            generateId(),
    title:         body.title.trim(),
    skillRequired: body.skillRequired.trim().toLowerCase(),
    pay:           (body.pay || '').trim(),
    description:   (body.description || '').trim(),
    area:          (body.area || '').trim(),
    posterName:    (body.posterName || '').trim(),
    posterPhone:   body.posterPhone.trim(),
    workDate:      body.workDate || today(),
    urgent:        !!body.urgent,
    createdAt:     new Date().toISOString()
  };
  jobs.unshift(job);
  writeStore('jobs', jobs);

  console.log(`📋 New job posted: [${job.id}] ${job.title} — ${job.area}`);
  sendJSON(res, 201, { job });
}

/* GET /api/workers?skill=plumber&area=Sion&available=true */
function handleGetWorkers(req, res) {
  const q = url.parse(req.url, true).query;
  let workers = readStore('workers');

  if (q.skill)     workers = workers.filter(w => w.skill === q.skill);
  if (q.area)      workers = workers.filter(w => w.area && w.area.toLowerCase().includes(q.area.toLowerCase()));
  if (q.available) workers = workers.filter(w => w.availableToday === true);
  if (q.verified)  workers = workers.filter(w => w.verified === true);

  // Sort — highest rating first
  workers.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  sendJSON(res, 200, { workers, meta: { total: workers.length } });
}

/* POST /api/workers */
async function handlePostWorker(req, res) {
  let body;
  try { body = await readBody(req); }
  catch (e) { return sendJSON(res, 400, { error: e.message }); }

  const errors = validateWorker(body);
  if (errors.length) return sendJSON(res, 422, { errors });

  const workers = readStore('workers');

  // Prevent duplicate phone registration
  const exists = workers.find(w => w.phone === body.phone.trim());
  if (exists) {
    // Update existing record instead of creating duplicate
    Object.assign(exists, {
      name:           body.name.trim(),
      skill:          body.skill.trim().toLowerCase(),
      area:           (body.area || '').trim(),
      ratePerDay:     parseInt(body.ratePerDay) || 0,
      availableToday: !!body.availableToday,
      updatedAt:      new Date().toISOString()
    });
    writeStore('workers', workers);
    console.log(`🔄 Worker updated: [${exists.id}] ${exists.name}`);
    return sendJSON(res, 200, { worker: exists, updated: true });
  }

  const worker = {
    id:             generateId(),
    name:           body.name.trim(),
    phone:          body.phone.trim(),
    skill:          body.skill.trim().toLowerCase(),
    area:           (body.area || '').trim(),
    ratePerDay:     parseInt(body.ratePerDay) || 0,
    availableToday: !!body.availableToday,
    experience:     (body.experience || '').trim(),
    verified:       false,         // set true after Aadhaar OTP in production
    rating:         0,
    jobsCompleted:  0,
    createdAt:      new Date().toISOString()
  };
  workers.push(worker);
  writeStore('workers', workers);

  console.log(`👷 New worker registered: [${worker.id}] ${worker.name} — ${worker.skill}`);
  sendJSON(res, 201, { worker });
}

/* GET /api/health */
function handleHealth(res) {
  const jobs    = readStore('jobs');
  const workers = readStore('workers');
  sendJSON(res, 200, {
    status:     'ok',
    uptime:     process.uptime().toFixed(1) + 's',
    jobs:       jobs.length,
    workers:    workers.length,
    timestamp:  new Date().toISOString()
  });
}

/* GET /api/stats */
function handleStats(res) {
  const jobs    = readStore('jobs');
  const workers = readStore('workers');

  const skillCounts = {};
  jobs.forEach(j => { skillCounts[j.skillRequired] = (skillCounts[j.skillRequired] || 0) + 1; });

  const workersBySkill = {};
  workers.forEach(w => { workersBySkill[w.skill] = (workersBySkill[w.skill] || 0) + 1; });

  sendJSON(res, 200, {
    totalJobs:          jobs.length,
    totalWorkers:       workers.length,
    availableWorkers:   workers.filter(w => w.availableToday).length,
    verifiedWorkers:    workers.filter(w => w.verified).length,
    urgentJobs:         jobs.filter(j => j.urgent).length,
    jobsBySkill:        skillCounts,
    workersBySkill
  });
}

/* DELETE /api/jobs/:id  (for future admin use) */
function handleDeleteJob(res, id) {
  let jobs = readStore('jobs');
  const before = jobs.length;
  jobs = jobs.filter(j => j.id !== id);
  if (jobs.length === before) return sendJSON(res, 404, { error: 'Job not found' });
  writeStore('jobs', jobs);
  console.log(`🗑️  Job deleted: ${id}`);
  sendJSON(res, 200, { deleted: true, id });
}

// ─── Main router ──────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  cors(res);

  // Preflight
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const parsed   = url.parse(req.url, true);
  const pathname = parsed.pathname.replace(/\/$/, '');   // strip trailing slash
  const method   = req.method.toUpperCase();

  console.log(`${method} ${pathname}`);

  // ── Routes ──
  if (pathname === '/api/health' && method === 'GET')
    return handleHealth(res);

  if (pathname === '/api/stats' && method === 'GET')
    return handleStats(res);

  if (pathname === '/api/jobs' && method === 'GET')
    return handleGetJobs(req, res);

  if (pathname === '/api/jobs' && method === 'POST')
    return handlePostJob(req, res);

  if (pathname.match(/^\/api\/jobs\/[a-z0-9]+$/) && method === 'DELETE') {
    const id = pathname.split('/').pop();
    return handleDeleteJob(res, id);
  }

  if (pathname === '/api/workers' && method === 'GET')
    return handleGetWorkers(req, res);

  if (pathname === '/api/workers' && method === 'POST')
    return handlePostWorker(req, res);

  // 404
  sendJSON(res, 404, { error: `Route not found: ${method} ${pathname}` });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
seedIfEmpty();

server.listen(PORT, () => {
  console.log(`\n🔨 RozgarSaathi Backend`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`▶  Running on  http://localhost:${PORT}`);
  console.log(`\n📡 Endpoints:`);
  console.log(`   GET    /api/health`);
  console.log(`   GET    /api/stats`);
  console.log(`   GET    /api/jobs              ?skill= &area= &date= &urgent= &limit= &page=`);
  console.log(`   POST   /api/jobs`);
  console.log(`   DELETE /api/jobs/:id`);
  console.log(`   GET    /api/workers           ?skill= &area= &available= &verified=`);
  console.log(`   POST   /api/workers`);
  console.log(`\n💾 Data stored in:  ./data/jobs.json & ./data/workers.json`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE')
    console.error(`❌ Port ${PORT} is already in use. Try: PORT=8081 node server.js`);
  else
    console.error('Server error:', err);
});