

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT = process.env.PORT || 8080;
const DB_PATH = path.join(__dirname, 'db.json');

// ═══════════════════════════════════════════════════════════════════
// DATABASE LAYER
// ═══════════════════════════════════════════════════════════════════

const DB_SCHEMA = {
  workers: [],   // registered workers
  jobs: [],      // posted jobs
  ratings: [],   // worker ratings after job completion
  contacts: []   // contact events (worker↔hirer connections)
};

function dbRead() {
  try {
    if (!fs.existsSync(DB_PATH)) return JSON.parse(JSON.stringify(DB_SCHEMA));
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch { return JSON.parse(JSON.stringify(DB_SCHEMA)); }
}

function dbWrite(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function now() { return new Date().toISOString(); }
function today() { return new Date().toISOString().slice(0, 10); }

// ── Seed ──────────────────────────────────────────────────────────
function seed() {
  const db = dbRead();
  if (db.workers.length > 0) return;

  db.workers = [
    { id: uid(), name: 'Mohan Yadav',    phone: '9876501001', skill: 'plumber',     area: 'Sion',        pincode: '400022', ratePerDay: 550, availableToday: true,  verified: true,  rating: 4.8, jobsCompleted: 34, experience: '8 years residential & commercial plumbing', bio: 'Motor repair, pipe fitting, sanitary work', createdAt: now() },
    { id: uid(), name: 'Dinesh Kumar',   phone: '9876501002', skill: 'electrician', area: 'Kurla',       pincode: '400070', ratePerDay: 700, availableToday: true,  verified: true,  rating: 4.9, jobsCompleted: 61, experience: '12 years wiring, MCB, AC installation',    bio: 'Expert in 3-phase wiring & panel boards',  createdAt: now() },
    { id: uid(), name: 'Sanjay Rathore', phone: '9876501003', skill: 'painter',     area: 'Chembur',     pincode: '400071', ratePerDay: 600, availableToday: false, verified: true,  rating: 4.7, jobsCompleted: 22, experience: '6 years interior & exterior painting',      bio: 'Asian Paints certified, putty & polish',   createdAt: now() },
    { id: uid(), name: 'Raju Carpenter', phone: '9876501004', skill: 'carpenter',   area: 'Bandra',      pincode: '400050', ratePerDay: 750, availableToday: true,  verified: false, rating: 4.5, jobsCompleted: 18, experience: '10 years furniture & modular fitting',       bio: 'Modular kitchen, wardrobes, false ceiling', createdAt: now() },
    { id: uid(), name: 'Suresh Tile',    phone: '9876501005', skill: 'tile',        area: 'Ghatkopar',   pincode: '400077', ratePerDay: 700, availableToday: true,  verified: true,  rating: 4.6, jobsCompleted: 29, experience: '7 years floor & wall tiling',               bio: 'Vitrified, ceramic, mosaic — all types',   createdAt: now() },
    { id: uid(), name: 'Prakash Singh',  phone: '9876501006', skill: 'mazdoor',     area: 'Dharavi',     pincode: '400017', ratePerDay: 450, availableToday: true,  verified: false, rating: 4.3, jobsCompleted: 47, experience: '5 years construction helper',                bio: 'Loading, shifting, digging, general labour', createdAt: now() },
    { id: uid(), name: 'Arjun Welder',   phone: '9876501007', skill: 'welder',      area: 'Andheri',     pincode: '400058', ratePerDay: 800, availableToday: false, verified: true,  rating: 4.7, jobsCompleted: 33, experience: '9 years arc welding & fabrication',          bio: 'MS fabrication, gate, railing, tank repair', createdAt: now() },
    { id: uid(), name: 'Meena Bai',      phone: '9876501008', skill: 'cleaner',     area: 'Dadar',       pincode: '400014', ratePerDay: 350, availableToday: true,  verified: true,  rating: 4.9, jobsCompleted: 88, experience: '10 years deep cleaning services',            bio: 'Post-construction, move-in/out deep clean',  createdAt: now() },
  ];

  db.jobs = [
    { id: uid(), title: 'Pipe leakage repair — kitchen & bathroom',   skillRequired: 'plumber',     pay: 600,  payUnit: 'day',  description: '2 leaking pipes under sink and bathroom. Bring own tools. 2–3 hrs work.',            area: 'Sion West',    pincode: '400022', posterName: 'Ramesh K.',          posterPhone: '9876500001', workDate: today(), urgent: true,  status: 'open', createdAt: now() },
    { id: uid(), title: 'Full wiring — new 2BHK flat',                skillRequired: 'electrician', pay: 800,  payUnit: 'day',  description: 'Complete internal wiring for new 2BHK. Must know MCB setup. 2-day contract.',         area: 'Chembur East', pincode: '400071', posterName: 'Suresh Contractors', posterPhone: '9876500002', workDate: today(), urgent: false, status: 'open', createdAt: now() },
    { id: uid(), title: '3BHK interior painting, 2 coats',            skillRequired: 'painter',     pay: 650,  payUnit: 'day',  description: 'Full flat — 3 BHK. Paint & material by owner. Starts tomorrow. Experienced only.',    area: 'Kurla West',   pincode: '400070', posterName: 'Mehta Family',        posterPhone: '9876500003', workDate: today(), urgent: false, status: 'open', createdAt: now() },
    { id: uid(), title: 'Office furniture shifting — need 3 helpers', skillRequired: 'mazdoor',     pay: 450,  payUnit: 'day',  description: 'Office relocation. Heavy furniture & boxes. 8 AM sharp. Food & water provided.',      area: 'Andheri West', pincode: '400058', posterName: 'Move-It Logistics',   posterPhone: '9876500004', workDate: today(), urgent: true,  status: 'open', createdAt: now() },
    { id: uid(), title: 'Modular kitchen cabinet assembly',           skillRequired: 'carpenter',   pay: 700,  payUnit: 'day',  description: 'Pre-manufactured units to assemble and wall-fix. 1-day job. Experienced only.',        area: 'Bandra East',  pincode: '400050', posterName: 'Home Reno Co.',       posterPhone: '9876500005', workDate: today(), urgent: false, status: 'open', createdAt: now() },
    { id: uid(), title: 'Bathroom tiling — 60×60 vitrified, full room', skillRequired: 'tile',      pay: 750,  payUnit: 'day',  description: 'Floor + wall tiling. Tiles & adhesive supplied. Grout included. Experienced setter.', area: 'Ghatkopar W',  pincode: '400077', posterName: 'Raj Construction',    posterPhone: '9876500006', workDate: today(), urgent: false, status: 'open', createdAt: now() },
    { id: uid(), title: 'AC installation — 2 split units',            skillRequired: 'electrician', pay: 900,  payUnit: 'job',  description: 'Install 2 x 1.5 ton split ACs. Drilling, piping, wiring. All materials provided.',   area: 'Dadar West',   pincode: '400028', posterName: 'Patel Residence',     posterPhone: '9876500007', workDate: today(), urgent: true,  status: 'open', createdAt: now() },
    { id: uid(), title: 'Gate welding & fabrication repair',          skillRequired: 'welder',      pay: 1200, payUnit: 'job',  description: 'Main gate hinge broken, needs welding + minor fabrication. Material available.',      area: 'Borivali East', pincode: '400066', posterName: 'Society Manager',     posterPhone: '9876500008', workDate: today(), urgent: false, status: 'open', createdAt: now() },
  ];

  db.ratings = [];
  db.contacts = [];
  dbWrite(db);
  console.log('✅ Database seeded with demo data');
}

// ═══════════════════════════════════════════════════════════════════
// HTML FRONTEND (served at /)
// ═══════════════════════════════════════════════════════════════════

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RozgarSaathi — रोज़गार साथी</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
:root{
  --bg:#06080C;
  --bg2:#0D1117;
  --bg3:#141B24;
  --border:#1E2D3D;
  --border2:rgba(255,255,255,0.06);
  --orange:#FF5C00;
  --orange2:#FF8C42;
  --green:#00D98B;
  --green2:#00A86B;
  --red:#FF3B3B;
  --gold:#FFD166;
  --text:#F0E6D6;
  --text2:#8A9BAE;
  --text3:#4A5A6A;
  --wa:#25D366;
  --mono:'JetBrains Mono',monospace;
  --sans:'Syne',sans-serif;
  --deva:'Noto Sans Devanagari',sans-serif;
}
body{font-family:var(--sans);background:var(--bg);color:var(--text);overflow-x:hidden;cursor:none}
body::after{content:'';position:fixed;inset:0;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");opacity:.025;pointer-events:none;z-index:9999}

/* ── CURSOR ─────────────────────────────────────── */
#cur{width:8px;height:8px;background:var(--orange);border-radius:50%;position:fixed;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);transition:width .15s,height .15s,background .15s;mix-blend-mode:screen}
#cur2{width:28px;height:28px;border:1px solid rgba(255,92,0,.35);border-radius:50%;position:fixed;pointer-events:none;z-index:99998;transform:translate(-50%,-50%);transition:left .08s,top .08s,width .2s,height .2s}
body.hov #cur{width:18px;height:18px;background:var(--orange2)}
body.hov #cur2{width:48px;height:48px}

/* ── NAV ─────────────────────────────────────────── */
nav{position:fixed;top:0;left:0;right:0;z-index:500;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 32px;background:rgba(6,8,12,.9);backdrop-filter:blur(24px);border-bottom:1px solid var(--border)}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.logo-mark{width:34px;height:34px;background:var(--orange);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.logo-name{font-size:20px;font-weight:800;letter-spacing:-.5px;color:var(--text)}
.logo-name em{color:var(--orange);font-style:normal}
.logo-sub{font-family:var(--deva);font-size:10px;color:var(--text3);letter-spacing:.5px}
.nav-r{display:flex;gap:8px;align-items:center}
.nbtn{padding:7px 18px;border-radius:7px;font-size:12px;font-weight:700;font-family:var(--sans);cursor:pointer;border:none;letter-spacing:.3px;transition:all .18s}
.nbtn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border)}
.nbtn-ghost:hover{background:var(--bg3);color:var(--text);border-color:rgba(255,92,0,.3)}
.nbtn-o{background:var(--orange);color:#fff}
.nbtn-o:hover{background:var(--orange2);transform:translateY(-1px);box-shadow:0 4px 16px rgba(255,92,0,.3)}
.nbtn-g{background:var(--green);color:#000}
.nbtn-g:hover{background:#00F5A0;transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,217,139,.25)}

/* ── HERO ─────────────────────────────────────────── */
.hero{min-height:100vh;display:flex;align-items:center;position:relative;overflow:hidden;padding:80px 32px 60px}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,92,0,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,92,0,.03) 1px,transparent 1px);background-size:48px 48px}
.hero-blob1{position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(255,92,0,.12) 0%,transparent 70%);top:-100px;left:-100px;animation:blob 8s ease-in-out infinite alternate}
.hero-blob2{position:absolute;width:350px;height:350px;border-radius:50%;background:radial-gradient(circle,rgba(0,217,139,.08) 0%,transparent 70%);bottom:0;right:100px;animation:blob 10s ease-in-out infinite alternate-reverse}
@keyframes blob{0%{transform:scale(1) translate(0,0)}100%{transform:scale(1.2) translate(20px,-20px)}}
.hero-in{max-width:1100px;margin:0 auto;width:100%;position:relative;z-index:2;display:grid;grid-template-columns:1fr 440px;gap:64px;align-items:center}
.hero-pill{display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border:1px solid rgba(255,92,0,.25);border-radius:30px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--orange);background:rgba(255,92,0,.06);margin-bottom:24px;animation:fsin .7s ease both}
.dot-live{width:6px;height:6px;background:var(--orange);border-radius:50%;animation:pulse 1.4s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,92,0,.6)}50%{box-shadow:0 0 0 5px rgba(255,92,0,0)}}
.hero-h1{font-size:clamp(56px,7vw,88px);font-weight:800;line-height:.95;letter-spacing:-2px;margin-bottom:6px;animation:fsin .7s .1s ease both}
.hero-h1 .l1{color:var(--text)}
.hero-h1 .l2{color:var(--orange);display:block}
.hero-deva{font-family:var(--deva);font-size:clamp(20px,2.5vw,32px);font-weight:600;color:var(--gold);margin-bottom:24px;letter-spacing:0;animation:fsin .7s .2s ease both}
.hero-p{font-size:15px;line-height:1.75;color:var(--text2);max-width:460px;margin-bottom:36px;animation:fsin .7s .3s ease both}
.hero-p strong{color:var(--text)}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap;animation:fsin .7s .4s ease both}
.btn-primary{padding:13px 28px;background:var(--orange);color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:700;font-family:var(--sans);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:8px;letter-spacing:.2px}
.btn-primary:hover{background:var(--orange2);transform:translateY(-2px);box-shadow:0 8px 28px rgba(255,92,0,.4)}
.btn-sec{padding:13px 28px;background:transparent;color:var(--green);border:1.5px solid var(--green2);border-radius:9px;font-size:14px;font-weight:700;font-family:var(--sans);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:8px}
.btn-sec:hover{background:rgba(0,217,139,.08);border-color:var(--green);transform:translateY(-2px)}
.hero-stats{display:flex;gap:32px;margin-top:48px;animation:fsin .7s .5s ease both}
.stat-n{font-size:38px;font-weight:800;color:var(--orange);line-height:1;letter-spacing:-1px}
.stat-l{font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1.5px;margin-top:2px}
@keyframes fsin{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}

/* ── HERO FLOATING CARDS ─────────────────────────── */
.cards-cluster{position:relative;height:340px;animation:fsin .7s .3s ease both}
.fc{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px;position:absolute;transition:border-color .2s,transform .2s}
.fc:hover{border-color:rgba(255,92,0,.2)}
.fc-main{width:310px;top:40px;left:30px;z-index:3}
.fc-b1{width:255px;top:0;right:0;z-index:2;opacity:.8;transform:rotate(4deg)}
.fc-b2{width:240px;bottom:0;left:0;z-index:2;opacity:.75;transform:rotate(-3deg)}
.fc-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.fc-av{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;position:relative}
.fc-vbadge{position:absolute;bottom:-3px;right:-3px;width:14px;height:14px;background:var(--green);border-radius:50%;font-size:8px;color:#000;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg2)}
.fc-name{font-size:14px;font-weight:700;color:var(--text);line-height:1.2}
.fc-meta{font-size:11px;color:var(--text3);display:flex;align-items:center;gap:5px}
.adot{width:5px;height:5px;border-radius:50%;background:var(--green)}
.fc-tags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px}
.ftag{padding:2px 8px;border-radius:4px;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
.fc-foot{display:flex;justify-content:space-between;align-items:center}
.fc-rate{font-size:22px;font-weight:800;color:var(--green);letter-spacing:-1px;line-height:1}
.fc-rate span{font-size:11px;color:var(--text3);font-weight:400;letter-spacing:0}
.wa-btn{padding:7px 13px;background:var(--wa);color:#fff;border:none;border-radius:7px;font-size:11px;font-weight:700;font-family:var(--sans);cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .2s}
.wa-btn:hover{background:#1ebe5a;transform:translateY(-1px)}
.fc-stars{font-size:11px;color:var(--gold);font-weight:600}

/* ── FILTER STRIP ────────────────────────────────── */
.filter-strip{position:sticky;top:60px;z-index:400;background:rgba(13,17,23,.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0}
.filter-in{max-width:1100px;margin:0 auto;padding:0 32px;display:flex;align-items:center;gap:14px;height:56px}
.filter-label{font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text3);flex-shrink:0}
.chips{display:flex;gap:6px;overflow-x:auto;flex:1;scrollbar-width:none}
.chips::-webkit-scrollbar{display:none}
.chip{padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;font-family:var(--sans);cursor:pointer;white-space:nowrap;border:1px solid var(--border);background:transparent;color:var(--text3);transition:all .15s;letter-spacing:.3px}
.chip:hover{border-color:var(--border2);color:var(--text2)}
.chip.on{background:rgba(255,92,0,.1);border-color:rgba(255,92,0,.4);color:var(--orange)}
.filter-loc{display:flex;align-items:center;gap:6px;padding:5px 12px;border:1px solid var(--border);border-radius:7px;font-family:var(--mono);font-size:10px;color:var(--text2);flex-shrink:0;cursor:pointer;transition:border-color .2s}
.filter-loc:hover{border-color:rgba(255,92,0,.3)}

/* ── MAIN LAYOUT ─────────────────────────────────── */
.main{padding:40px 32px;background:var(--bg)}
.main-in{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 340px;gap:28px}

/* ── JOB FEED ────────────────────────────────────── */
.feed-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.feed-title{font-size:13px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:10px;letter-spacing:.5px;text-transform:uppercase;font-family:var(--mono)}
.cbadge{padding:2px 10px;background:rgba(255,92,0,.1);border:1px solid rgba(255,92,0,.25);border-radius:20px;font-size:10px;font-weight:700;color:var(--orange);font-family:var(--mono)}
.feed-updated{font-family:var(--mono);font-size:9px;color:var(--text3)}

.jcard{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:12px;transition:all .2s;cursor:pointer;position:relative;overflow:hidden}
.jcard::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--orange);border-radius:2px 0 0 2px}
.jcard.urgent::before{background:var(--red)}
.jcard.contract::before{background:var(--green)}
.jcard:hover{border-color:rgba(255,92,0,.2);background:var(--bg3);transform:translateX(3px)}
.jcard-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
.jcard-badges{display:flex;gap:6px;flex-wrap:wrap}
.jbadge{padding:2px 9px;border-radius:4px;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;font-family:var(--mono)}
.jb-urgent{background:rgba(255,59,59,.1);color:var(--red)}
.jb-contract{background:rgba(0,217,139,.08);color:var(--green)}
.jb-new{background:rgba(255,209,102,.08);color:var(--gold)}
.jpay{font-size:24px;font-weight:800;color:var(--green);letter-spacing:-1px;line-height:1;white-space:nowrap}
.jpay span{font-size:10px;color:var(--text3);font-weight:400;font-family:var(--mono);letter-spacing:0}
.jskill-badge{display:inline-flex;align-items:center;gap:5px;padding:2px 9px;border-radius:4px;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;font-family:var(--mono);margin-bottom:6px}
.jcard-title{font-size:15px;font-weight:700;color:var(--text);margin-bottom:5px;line-height:1.3}
.jcard-desc{font-size:12px;color:var(--text3);line-height:1.6;margin-bottom:14px}
.jcard-foot{display:flex;justify-content:space-between;align-items:center}
.jcard-loc{font-family:var(--mono);font-size:10px;color:var(--text3);display:flex;align-items:center;gap:6px}
.contact-btn{padding:7px 16px;background:var(--orange);color:#fff;border:none;border-radius:7px;font-size:11px;font-weight:700;font-family:var(--sans);cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .18s}
.contact-btn:hover{background:var(--orange2);transform:translateY(-1px);box-shadow:0 4px 12px rgba(255,92,0,.3)}
.empty-state{display:none;text-align:center;padding:64px 20px;color:var(--text3)}
.empty-ico{font-size:44px;margin-bottom:12px}
.empty-t{font-size:14px;font-weight:700;color:var(--text2)}
.empty-s{font-size:12px;margin-top:4px;font-family:var(--mono)}

/* ── SIDEBAR ─────────────────────────────────────── */
.sidebar-sticky{position:sticky;top:124px}
.post-cta{background:linear-gradient(135deg,rgba(255,92,0,.12),rgba(255,92,0,.04));border:1px solid rgba(255,92,0,.2);border-radius:14px;padding:20px;margin-bottom:22px;position:relative;overflow:hidden}
.post-cta::after{content:'🏗️';position:absolute;right:10px;top:5px;font-size:52px;opacity:.08;pointer-events:none}
.post-cta-t{font-size:18px;font-weight:800;color:var(--text);margin-bottom:5px;letter-spacing:-.3px}
.post-cta-s{font-size:11px;color:var(--text2);margin-bottom:14px;line-height:1.5}
.post-cta-btn{width:100%;padding:10px;background:var(--orange);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;font-family:var(--sans);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .2s}
.post-cta-btn:hover{background:var(--orange2);transform:translateY(-1px);box-shadow:0 5px 18px rgba(255,92,0,.3)}
.sw-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.sw-t{font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text2)}
.sw-more{font-size:10px;color:var(--orange);font-weight:700;cursor:pointer;background:none;border:none;font-family:var(--mono);letter-spacing:.5px}
.wcard{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;transition:all .18s}
.wcard:hover{border-color:rgba(0,217,139,.2);background:var(--bg3)}
.wcard-row{display:flex;gap:10px;align-items:flex-start;margin-bottom:8px}
.wav{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;position:relative}
.wvb{position:absolute;bottom:-3px;right:-3px;width:14px;height:14px;background:var(--green);border-radius:50%;font-size:8px;color:#000;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg2)}
.wname{font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px}
.wavail{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--text3);font-family:var(--mono)}
.avdot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.wrate{font-size:20px;font-weight:800;color:var(--green);letter-spacing:-1px;line-height:1;white-space:nowrap}
.wrate span{font-size:9px;color:var(--text3);font-weight:400;font-family:var(--mono);letter-spacing:0}
.wtags{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}
.wtag{padding:2px 7px;background:rgba(255,92,0,.06);border:1px solid rgba(255,92,0,.12);border-radius:3px;font-size:9px;font-weight:700;color:var(--text2);letter-spacing:.3px}
.wfoot{display:flex;justify-content:space-between;align-items:center}
.wstars{font-size:11px;color:var(--gold);font-weight:700}
.wstars span{color:var(--text3);font-weight:400;font-size:10px;font-family:var(--mono)}
.wa-sm{padding:6px 12px;background:var(--wa);color:#fff;border:none;border-radius:6px;font-size:10px;font-weight:700;font-family:var(--sans);cursor:pointer;display:flex;align-items:center;gap:4px;transition:all .18s}
.wa-sm:hover{background:#1ebe5a;transform:translateY(-1px)}

/* ── HOW IT WORKS ────────────────────────────────── */
.how{background:var(--bg2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:80px 32px}
.sec-in{max-width:1100px;margin:0 auto}
.sec-eyebrow{font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--orange);margin-bottom:12px;display:flex;align-items:center;gap:10px}
.sec-eyebrow::before{content:'';width:24px;height:1px;background:var(--orange)}
.sec-h{font-size:clamp(36px,4.5vw,56px);font-weight:800;color:var(--text);line-height:1;margin-bottom:12px;letter-spacing:-1px}
.sec-sub{font-size:14px;color:var(--text2);max-width:480px;line-height:1.7}
.how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;margin-top:52px}
.how-card{position:relative;padding:28px;background:var(--bg3);border:1px solid var(--border);border-radius:14px;transition:border-color .2s}
.how-card:hover{border-color:rgba(255,92,0,.2)}
.how-n{font-size:64px;font-weight:800;color:rgba(255,92,0,.07);line-height:1;position:absolute;top:12px;right:16px;letter-spacing:-3px;font-family:var(--mono)}
.how-ico{font-size:32px;margin-bottom:16px;display:block}
.how-t{font-size:18px;font-weight:800;color:var(--text);margin-bottom:8px;letter-spacing:-.3px}
.how-d{font-size:13px;color:var(--text3);line-height:1.7}

/* ── REGISTER ────────────────────────────────────── */
.reg{padding:80px 32px;background:var(--bg)}
.reg-tabs{display:inline-flex;gap:3px;margin-bottom:36px;background:var(--bg2);padding:4px;border-radius:10px;border:1px solid var(--border)}
.reg-tab{padding:9px 24px;border-radius:7px;font-size:13px;font-weight:700;font-family:var(--sans);cursor:pointer;border:none;background:transparent;color:var(--text3);transition:all .18s;letter-spacing:.2px}
.reg-tab.on{background:var(--orange);color:#fff}
.reg-layout{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start}
.form-panel{display:block}
.form-panel.hidden{display:none}
.fg{margin-bottom:16px}
.fl{display:block;font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text2);margin-bottom:7px}
.fi{width:100%;padding:11px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:9px;font-size:13px;font-family:var(--sans);color:var(--text);outline:none;transition:border-color .2s,background .2s}
.fi:focus{border-color:rgba(255,92,0,.4);background:var(--bg3)}
.fi::placeholder{color:var(--text3)}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fsel{width:100%;padding:11px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:9px;font-size:13px;font-family:var(--sans);color:var(--text);outline:none;cursor:pointer;appearance:none;transition:border-color .2s}
.fsel:focus{border-color:rgba(255,92,0,.4)}
.fsel option{background:var(--bg2)}
.fta{resize:vertical;min-height:75px}
.skill-grid{display:flex;flex-wrap:wrap;gap:7px}
.stoggle{padding:6px 14px;border-radius:7px;font-size:11px;font-weight:700;font-family:var(--sans);cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--text3);transition:all .15s;letter-spacing:.2px}
.stoggle.on{border-color:var(--orange);background:rgba(255,92,0,.1);color:var(--orange)}

/* Aadhaar box */
.aadhaar{background:rgba(0,217,139,.04);border:1px solid rgba(0,217,139,.15);border-radius:10px;padding:16px;margin-bottom:16px}
.aadhaar-t{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:700;color:var(--green);margin-bottom:5px}
.aadhaar-s{font-size:11px;color:var(--text3);margin-bottom:12px;line-height:1.5;font-family:var(--mono)}
.otp-row{display:flex;gap:8px}
.otp-i{flex:1;padding:10px 13px;background:var(--bg2);border:1px solid rgba(0,217,139,.2);border-radius:8px;font-size:13px;font-family:var(--sans);color:var(--text);outline:none}
.otp-i:focus{border-color:var(--green)}
.otp-btn{padding:10px 16px;background:var(--green);color:#000;border:none;border-radius:8px;font-size:11px;font-weight:700;font-family:var(--sans);cursor:pointer;white-space:nowrap;transition:background .2s}
.otp-btn:hover{background:#00F5A0}
.fsub{width:100%;padding:13px;border-radius:10px;border:none;font-size:14px;font-weight:700;font-family:var(--sans);cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:7px;letter-spacing:.2px}
.fsub-o{background:linear-gradient(135deg,var(--orange),#FF3D00);color:#fff}
.fsub-g{background:linear-gradient(135deg,var(--green),var(--green2));color:#000}
.fsub:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,92,0,.25)}
.reg-info-t{font-size:34px;font-weight:800;color:var(--text);line-height:1.1;margin-bottom:14px;letter-spacing:-1px}
.reg-info-t span{color:var(--orange)}
.perks{list-style:none;margin-bottom:28px}
.perks li{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--border);font-size:13px;color:var(--text2);line-height:1.5}
.perks li:last-child{border:none}
.perk-ico{font-size:20px;flex-shrink:0;margin-top:1px}
.nofee{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;background:rgba(255,92,0,.07);border:1px solid rgba(255,92,0,.2);border-radius:8px;font-size:12px;font-weight:700;color:var(--orange);font-family:var(--mono);letter-spacing:.5px}

/* ── MODALS ──────────────────────────────────────── */
.overlay{display:none;position:fixed;inset:0;background:rgba(6,8,12,.88);backdrop-filter:blur(10px);z-index:800;align-items:center;justify-content:center;padding:20px}
.overlay.open{display:flex}
.modal{background:var(--bg2);border:1px solid var(--border);border-radius:18px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;animation:min .28s ease}
@keyframes min{from{opacity:0;transform:scale(.95) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
.mhdr{padding:22px 26px 0;display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.mhdr-t{font-size:22px;font-weight:800;color:var(--text);letter-spacing:-.5px}
.mclose{width:32px;height:32px;border-radius:50%;background:var(--bg3);border:1px solid var(--border);cursor:pointer;font-size:14px;color:var(--text3);display:flex;align-items:center;justify-content:center;transition:color .18s;font-family:monospace}
.mclose:hover{color:var(--text)}
.msub{padding:0 26px 16px;font-family:var(--mono);font-size:10px;color:var(--text3);letter-spacing:.5px;border-bottom:1px solid var(--border)}
.mbody{padding:22px 26px}
.wa-center{text-align:center;padding:0 26px 26px}
.wa-ico{font-size:56px;margin-bottom:12px}
.wa-pname{font-size:26px;font-weight:800;color:var(--text);letter-spacing:-.5px;margin-bottom:3px}
.wa-pskill{font-family:var(--mono);font-size:11px;color:var(--text3);letter-spacing:1px;margin-bottom:18px;text-transform:uppercase}
.wa-steps{background:rgba(0,217,139,.04);border:1px solid rgba(0,217,139,.12);border-radius:10px;padding:14px;text-align:left;margin-bottom:18px}
.wstep{display:flex;gap:10px;align-items:flex-start;margin-bottom:9px}
.wstep:last-child{margin-bottom:0}
.wstep-n{width:22px;height:22px;background:var(--wa);border-radius:50%;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:var(--mono)}
.wstep-t{font-size:12px;color:var(--text2);line-height:1.5}
.wa-open{width:100%;padding:14px;background:var(--wa);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;font-family:var(--sans);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;margin-bottom:10px}
.wa-open:hover{background:#1ebe5a;transform:translateY(-2px);box-shadow:0 6px 20px rgba(37,211,102,.25)}
.nocomm{font-family:var(--mono);font-size:10px;color:var(--text3);display:flex;align-items:center;justify-content:center;gap:7px}

/* ── TOAST ───────────────────────────────────────── */
.toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(80px);background:var(--bg3);border:1px solid rgba(255,92,0,.3);color:var(--text);padding:12px 24px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;transition:transform .35s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;display:flex;align-items:center;gap:8px;box-shadow:0 10px 40px rgba(0,0,0,.6);font-family:var(--mono)}
.toast.show{transform:translateX(-50%) translateY(0)}

/* ── FOOTER ──────────────────────────────────────── */
footer{background:var(--bg2);border-top:1px solid var(--border);padding:56px 32px 28px}
.foot-in{max-width:1100px;margin:0 auto}
.foot-top{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:56px;padding-bottom:36px;border-bottom:1px solid var(--border);margin-bottom:24px}
.foot-desc{font-size:12px;color:var(--text3);line-height:1.7;margin-top:10px;max-width:240px;font-family:var(--mono)}
.foot-col-t{font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--text2);margin-bottom:14px}
.foot-links{list-style:none}
.foot-links li{margin-bottom:9px;font-size:13px;color:var(--text3);cursor:pointer;transition:color .15s}
.foot-links li:hover{color:var(--text2)}
.foot-bottom{display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:10px;color:var(--text3)}
.foot-pill{display:flex;align-items:center;gap:6px;padding:5px 14px;background:rgba(0,217,139,.06);border:1px solid rgba(0,217,139,.15);border-radius:20px;font-size:9px;font-weight:700;color:var(--green);letter-spacing:1px}

/* ── SCROLLBAR ───────────────────────────────────── */
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:rgba(255,92,0,.25);border-radius:2px}
::-webkit-scrollbar-thumb:hover{background:rgba(255,92,0,.45)}

/* ── RESPONSIVE ──────────────────────────────────── */
@media(max-width:900px){
  nav{padding:0 18px}
  .hero,.main,.how,.reg{padding-left:18px;padding-right:18px}
  .hero-in{grid-template-columns:1fr}
  .cards-cluster{display:none}
  .main-in{grid-template-columns:1fr}
  .sidebar-sticky{position:static}
  .how-grid{grid-template-columns:1fr}
  .reg-layout{grid-template-columns:1fr}
  .foot-top{grid-template-columns:1fr;gap:28px}
  .frow{grid-template-columns:1fr}
  .nav-r .nbtn-ghost{display:none}
}

/* ── SKILL COLORS ────────────────────────────────── */
.sk-plumber{background:rgba(59,130,246,.1);color:#60A5FA}
.sk-electrician{background:rgba(251,191,36,.08);color:#FCD34D}
.sk-painter{background:rgba(244,114,182,.08);color:#F472B6}
.sk-carpenter{background:rgba(52,211,153,.08);color:#34D399}
.sk-mazdoor{background:rgba(167,139,250,.08);color:#A78BFA}
.sk-tile{background:rgba(251,146,60,.08);color:#FB923C}
.sk-welder{background:rgba(248,113,113,.08);color:#F87171}
.sk-cleaner{background:rgba(94,234,212,.08);color:#5EEAD4}
</style>
</head>
<body>
<div id="cur"></div><div id="cur2"></div>

<!-- ══ NAV ══════════════════════════════════════════ -->
<nav>
  <a class="logo" href="#">
    <div class="logo-mark">🔨</div>
    <div>
      <div class="logo-name">Rozgar<em>Saathi</em></div>
      <div class="logo-sub">रोज़गार साथी · Zero Commission</div>
    </div>
  </a>
  <div class="nav-r">
    <button class="nbtn nbtn-ghost" onclick="goto('jobs')">Browse Jobs</button>
    <button class="nbtn nbtn-ghost" onclick="goto('how')">How It Works</button>
    <button class="nbtn nbtn-g" onclick="goto('register')">👷 Register</button>
    <button class="nbtn nbtn-o" onclick="openPostModal()">+ Post Job</button>
  </div>
</nav>

<!-- ══ HERO ══════════════════════════════════════════ -->
<section class="hero" id="hero">
  <div class="hero-grid"></div>
  <div class="hero-blob1"></div>
  <div class="hero-blob2"></div>
  <div class="hero-in">
    <div>
      <div class="hero-pill"><span class="dot-live"></span><span id="heroLiveCount">86 Jobs Live Today</span></div>
      <h1 class="hero-h1">
        <span class="l1">KAAM DHUNDO</span>
        <span class="l2">SEEDHA GHAR SE.</span>
      </h1>
      <div class="hero-deva">नाका छोड़ो — डिजिटल पर आओ।</div>
      <p class="hero-p">Daily wage workers — plumbers, electricians, painters, mazdoors — connect directly with households and contractors. <strong>No middleman. No commission. Just work.</strong></p>
      <div class="hero-btns">
        <button class="btn-primary" onclick="goto('register')">👷 Register as Worker</button>
        <button class="btn-sec" onclick="openPostModal()">📋 Post a Job Today</button>
      </div>
      <div class="hero-stats">
        <div><div class="stat-n" id="statWorkers">—</div><div class="stat-l">Workers Active</div></div>
        <div><div class="stat-n" id="statJobs">—</div><div class="stat-l">Jobs Today</div></div>
        <div><div class="stat-n">₹0</div><div class="stat-l">Commission</div></div>
        <div><div class="stat-n" id="statAreas">12</div><div class="stat-l">Localities</div></div>
      </div>
    </div>
    <div class="cards-cluster">
      <div class="fc fc-b1">
        <div class="fc-row">
          <div class="fc-av sk-electrician">⚡<div class="fc-vbadge">✓</div></div>
          <div><div class="fc-name">Dinesh Kumar</div><div class="fc-meta"><span class="adot"></span>Available · Kurla</div></div>
        </div>
        <div class="fc-foot"><div class="fc-rate">₹700 <span>/day</span></div><div class="fc-stars">⭐ 4.9</div></div>
      </div>
      <div class="fc fc-b2">
        <div class="fc-row">
          <div class="fc-av sk-painter">🖌️<div class="fc-vbadge">✓</div></div>
          <div><div class="fc-name">Sanjay Rathore</div><div class="fc-meta"><span class="adot" style="background:var(--gold)"></span>Tomorrow · Chembur</div></div>
        </div>
        <div class="fc-foot"><div class="fc-rate">₹600 <span>/day</span></div><div class="fc-stars">⭐ 4.7</div></div>
      </div>
      <div class="fc fc-main">
        <div class="fc-row">
          <div class="fc-av sk-plumber">🔧<div class="fc-vbadge">✓</div></div>
          <div><div class="fc-name">Mohan Yadav</div><div class="fc-meta"><span class="adot"></span>Available Now · Sion</div></div>
        </div>
        <div class="fc-tags">
          <span class="ftag sk-plumber">Plumbing</span>
          <span class="ftag sk-plumber">Pipe Fitting</span>
          <span class="ftag sk-plumber">Motor Repair</span>
        </div>
        <div class="fc-foot">
          <div><div class="fc-rate">₹550 <span>/day</span></div><div class="fc-stars" style="margin-top:3px">⭐ 4.8 <span style="color:var(--text3);font-size:10px">(34)</span></div></div>
          <button class="wa-btn" onclick="openWA('Mohan Yadav','Plumber · Verified ✓')">💬 WhatsApp</button>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══ FILTER STRIP ════════════════════════════════ -->
<div class="filter-strip" id="jobs">
  <div class="filter-in">
    <span class="filter-label">Skill</span>
    <div class="chips" id="chips">
      <button class="chip on" data-skill="all" onclick="filterSkill('all',this)">🔍 All Jobs</button>
      <button class="chip" data-skill="plumber" onclick="filterSkill('plumber',this)">🔧 Plumber</button>
      <button class="chip" data-skill="electrician" onclick="filterSkill('electrician',this)">⚡ Electrician</button>
      <button class="chip" data-skill="painter" onclick="filterSkill('painter',this)">🖌️ Painter</button>
      <button class="chip" data-skill="carpenter" onclick="filterSkill('carpenter',this)">🪚 Carpenter</button>
      <button class="chip" data-skill="mazdoor" onclick="filterSkill('mazdoor',this)">💪 Mazdoor</button>
      <button class="chip" data-skill="tile" onclick="filterSkill('tile',this)">🪟 Tile Layer</button>
      <button class="chip" data-skill="welder" onclick="filterSkill('welder',this)">🔩 Welder</button>
      <button class="chip" data-skill="cleaner" onclick="filterSkill('cleaner',this)">🧹 Cleaner</button>
    </div>
    <div class="filter-loc">📍 Mumbai ▾</div>
  </div>
</div>

<!-- ══ MAIN / FEED ══════════════════════════════════ -->
<div class="main">
  <div class="main-in">
    <div>
      <div class="feed-hdr">
        <div class="feed-title"><span class="dot-live"></span> Live Job Feed <span class="cbadge" id="jobCount">loading…</span></div>
        <span class="feed-updated" id="feedUpdated"></span>
      </div>
      <div id="jobFeed"></div>
      <div class="empty-state" id="noJobs">
        <div class="empty-ico">🔍</div>
        <div class="empty-t">No jobs for this skill yet</div>
        <div class="empty-s">Be the first to post one — it's free.</div>
      </div>
    </div>
    <div>
      <div class="sidebar-sticky">
        <div class="post-cta">
          <div class="post-cta-t">Need someone today?</div>
          <div class="post-cta-s">Post your job in 60 seconds. Workers nearby see it immediately.</div>
          <button class="post-cta-btn" onclick="openPostModal()">+ Post a Job — Free</button>
        </div>
        <div class="sw-hdr">
          <div class="sw-t">Available Workers</div>
          <button class="sw-more" onclick="goto('register')">See All →</button>
        </div>
        <div id="workerList"></div>
      </div>
    </div>
  </div>
</div>

<!-- ══ HOW IT WORKS ═════════════════════════════════ -->
<div class="how" id="how">
  <div class="sec-in">
    <div class="sec-eyebrow">How It Works</div>
    <div class="sec-h">SIMPLE. DIRECT.<br>NO AGENT.</div>
    <div class="sec-sub">Three steps to connect — whether you're looking for work or need a worker today.</div>
    <div class="how-grid">
      <div class="how-card"><div class="how-n">01</div><span class="how-ico">📝</span><div class="how-t">Register Your Skill</div><div class="how-d">Workers list skills, daily rate, and availability. Verify with Aadhaar OTP to get the ✓ badge — verified workers get 3× more calls.</div></div>
      <div class="how-card"><div class="how-n">02</div><span class="how-ico">📍</span><div class="how-t">Geo-Based Job Feed</div><div class="how-d">Jobs appear sorted by distance from your area. Filter by skill. See pay rate and full description before you respond.</div></div>
      <div class="how-card"><div class="how-n">03</div><span class="how-ico">💬</span><div class="how-t">WhatsApp Directly</div><div class="how-d">One tap opens WhatsApp with a pre-filled message in Hindi. Negotiate, confirm — pay the worker directly. We take ₹0.</div></div>
    </div>
  </div>
</div>

<!-- ══ REGISTER ══════════════════════════════════════ -->
<div class="reg" id="register">
  <div class="sec-in">
    <div class="sec-eyebrow">Join RozgarSaathi</div>
    <div class="reg-tabs">
      <button class="reg-tab on" onclick="switchTab('worker',this)">👷 I'm a Worker</button>
      <button class="reg-tab" onclick="switchTab('hirer',this)">🏠 I Need Workers</button>
    </div>
    <div class="reg-layout">
      <!-- Worker Form -->
      <div class="form-panel" id="workerPanel">
        <div class="fg"><label class="fl">Full Name</label><input id="wName" class="fi" placeholder="Mohan Sharma"/></div>
        <div class="frow">
          <div class="fg"><label class="fl">WhatsApp Number</label><input id="wPhone" class="fi" placeholder="9876543210"/></div>
          <div class="fg"><label class="fl">Your Area / Naka</label><input id="wArea" class="fi" placeholder="Sion Naka, Mumbai"/></div>
        </div>
        <div class="fg">
          <label class="fl">Your Skills</label>
          <div class="skill-grid">
            <button class="stoggle" data-skill="plumber" onclick="toggleSkill(this)">🔧 Plumber</button>
            <button class="stoggle" data-skill="electrician" onclick="toggleSkill(this)">⚡ Electrician</button>
            <button class="stoggle" data-skill="painter" onclick="toggleSkill(this)">🖌️ Painter</button>
            <button class="stoggle" data-skill="carpenter" onclick="toggleSkill(this)">🪚 Carpenter</button>
            <button class="stoggle" data-skill="mazdoor" onclick="toggleSkill(this)">💪 Mazdoor</button>
            <button class="stoggle" data-skill="tile" onclick="toggleSkill(this)">🪟 Tile Layer</button>
            <button class="stoggle" data-skill="welder" onclick="toggleSkill(this)">🔩 Welder</button>
            <button class="stoggle" data-skill="cleaner" onclick="toggleSkill(this)">🧹 Cleaner</button>
          </div>
        </div>
        <div class="frow">
          <div class="fg"><label class="fl">Daily Rate (₹)</label><input id="wRate" class="fi" placeholder="e.g. 600" type="number"/></div>
          <div class="fg"><label class="fl">Availability</label>
            <select id="wAvail" class="fsel">
              <option value="today">✅ Available Now</option>
              <option value="afternoon">🕗 From Afternoon</option>
              <option value="tomorrow">📅 Tomorrow</option>
              <option value="unavailable">❌ Not Today</option>
            </select>
          </div>
        </div>
        <div class="fg"><label class="fl">Work Experience (optional)</label><textarea id="wExp" class="fi fta" placeholder="e.g. 8 years plumbing — residential and commercial…"></textarea></div>
        <div class="aadhaar">
          <div class="aadhaar-t">🛡️ Aadhaar OTP Verification <span style="font-size:10px;color:var(--text3);font-weight:400">(Recommended)</span></div>
          <div class="aadhaar-s">Workers with Aadhaar ✓ badge get 3× more job contacts.</div>
          <div class="fg" style="margin-bottom:10px"><input class="fi" placeholder="Aadhaar Number (12 digits)" style="border-color:rgba(0,217,139,.2)"/></div>
          <div class="otp-row">
            <input class="otp-i" placeholder="Enter OTP sent to Aadhaar mobile"/>
            <button class="otp-btn" onclick="toast('📱 OTP sent to Aadhaar-linked mobile!')">Send OTP</button>
          </div>
        </div>
        <button class="fsub fsub-g" onclick="submitWorker()">✓ Register Free — Start Getting Jobs Today</button>
      </div>
      <!-- Hirer Form -->
      <div class="form-panel hidden" id="hirerPanel">
        <div class="fg"><label class="fl">Job Title</label><input id="hTitle" class="fi" placeholder="e.g. Pipe leakage repair — kitchen & bathroom"/></div>
        <div class="frow">
          <div class="fg"><label class="fl">Skill Needed</label>
            <select id="hSkill" class="fsel">
              <option value="plumber">🔧 Plumber</option>
              <option value="electrician">⚡ Electrician</option>
              <option value="painter">🖌️ Painter</option>
              <option value="carpenter">🪚 Carpenter</option>
              <option value="mazdoor">💪 Mazdoor</option>
              <option value="tile">🪟 Tile Layer</option>
              <option value="welder">🔩 Welder</option>
              <option value="cleaner">🧹 Cleaner</option>
            </select>
          </div>
          <div class="fg"><label class="fl">Duration</label>
            <select class="fsel">
              <option>Half day (4 hrs)</option>
              <option>Full day</option>
              <option>2–3 days</option>
              <option>Weekly contract</option>
            </select>
          </div>
        </div>
        <div class="fg"><label class="fl">Job Description</label><textarea id="hDesc" class="fi fta" placeholder="Describe the work — scope, what materials you'll provide…"></textarea></div>
        <div class="frow">
          <div class="fg"><label class="fl">Pay Offered (₹)</label><input id="hPay" class="fi" placeholder="e.g. 600 per day"/></div>
          <div class="fg"><label class="fl">Start Time</label><input class="fi" type="time" value="08:00"/></div>
        </div>
        <div class="frow">
          <div class="fg"><label class="fl">Your Area</label><input id="hArea" class="fi" placeholder="Sion West, Mumbai"/></div>
          <div class="fg"><label class="fl">Your Name / Company</label><input id="hPoster" class="fi" placeholder="Mehta Family / ABC Contractors"/></div>
        </div>
        <div class="fg"><label class="fl">WhatsApp Number</label><input id="hPhone" class="fi" placeholder="9876543210"/></div>
        <button class="fsub fsub-o" onclick="submitJob()">🚀 Post Job — Workers See This Instantly</button>
      </div>
      <!-- Info Panel -->
      <div>
        <div class="reg-info-t">Why <span>RozgarSaathi</span><br>is different.</div>
        <ul class="perks">
          <li><span class="perk-ico">🚫</span><div><strong style="color:var(--text)">Zero commission, always.</strong><br>We take nothing. What you earn, you keep. What you agree to pay, goes directly to the worker.</div></li>
          <li><span class="perk-ico">📍</span><div><strong style="color:var(--text)">Hyperlocal — your naka, online.</strong><br>Jobs sorted by distance. Workers from your area show up first.</div></li>
          <li><span class="perk-ico">🛡️</span><div><strong style="color:var(--text)">Aadhaar-verified badges.</strong><br>Workers who complete OTP get a ✓ badge. Hirers trust verified professionals.</div></li>
          <li><span class="perk-ico">💬</span><div><strong style="color:var(--text)">WhatsApp-first contact.</strong><br>No app to install. Everyone already uses WhatsApp.</div></li>
          <li><span class="perk-ico">⭐</span><div><strong style="color:var(--text)">Ratings build reputation.</strong><br>Every completed job adds to your public rating. Good workers get more calls.</div></li>
        </ul>
        <div class="nofee">🤝 No Middleman · No Agent Cut · No Registration Fee</div>
      </div>
    </div>
  </div>
</div>

<!-- ══ FOOTER ════════════════════════════════════════ -->
<footer>
  <div class="foot-in">
    <div class="foot-top">
      <div>
        <div class="logo" style="display:flex;align-items:center;gap:10px;text-decoration:none">
          <div class="logo-mark">🔨</div>
          <div class="logo-name" style="font-size:20px;font-weight:800;letter-spacing:-.5px;color:var(--text)">Rozgar<em style="color:var(--orange);font-style:normal">Saathi</em></div>
        </div>
        <p class="foot-desc">Connecting daily wage workers directly with households and contractors. No middleman. No commission. Just kaam.</p>
      </div>
      <div>
        <div class="foot-col-t">For Workers</div>
        <ul class="foot-links">
          <li onclick="goto('register')">Register Your Skills</li>
          <li>Set Availability</li>
          <li>Get Aadhaar Verified</li>
          <li>Build Your Rating</li>
          <li onclick="goto('jobs')">Browse Jobs Near You</li>
        </ul>
      </div>
      <div>
        <div class="foot-col-t">For Hirers</div>
        <ul class="foot-links">
          <li onclick="openPostModal()">Post a Job Free</li>
          <li onclick="goto('jobs')">Find Workers Nearby</li>
          <li>Filter by Skill</li>
          <li>Verified Worker List</li>
          <li>Contact via WhatsApp</li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2025 RozgarSaathi · Made for India's daily wage workers</span>
      <div class="foot-pill">🤝 ₹0 Commission · Always Free</div>
    </div>
  </div>
</footer>

<!-- ══ WA MODAL ══════════════════════════════════════ -->
<div class="overlay" id="waModal" onclick="closeOut(event,'waModal')">
  <div class="modal">
    <div class="mhdr"><div class="mhdr-t">Direct Contact</div><button class="mclose" onclick="closeModal('waModal')">✕</button></div>
    <div class="msub">NO PLATFORM INVOLVEMENT — CONNECT DIRECTLY</div>
    <div class="wa-center">
      <div class="wa-ico">💬</div>
      <div class="wa-pname" id="waName">—</div>
      <div class="wa-pskill" id="waSkill">—</div>
      <div class="wa-steps">
        <div class="wstep"><div class="wstep-n">1</div><div class="wstep-t">Tap below — WhatsApp opens with a <strong style="color:var(--text)">pre-filled message in Hindi</strong> to confirm your job details.</div></div>
        <div class="wstep"><div class="wstep-n">2</div><div class="wstep-t">Share your address and when you need the work. Agree on rate directly.</div></div>
        <div class="wstep"><div class="wstep-n">3</div><div class="wstep-t"><strong style="color:var(--text)">Pay the worker directly</strong> — cash or UPI. RozgarSaathi takes ₹0.</div></div>
      </div>
      <button class="wa-open" onclick="launchWA()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Open WhatsApp — Chat Directly
      </button>
      <div class="nocomm">🚫 No commission &nbsp;·&nbsp; 💸 Direct payment to worker</div>
    </div>
  </div>
</div>

<!-- ══ POST JOB MODAL ════════════════════════════════ -->
<div class="overlay" id="postModal" onclick="closeOut(event,'postModal')">
  <div class="modal">
    <div class="mhdr"><div class="mhdr-t">📋 Post a Job</div><button class="mclose" onclick="closeModal('postModal')">✕</button></div>
    <div class="msub">FREE TO POST · WORKERS NEARBY SEE THIS INSTANTLY</div>
    <div class="mbody">
      <div class="fg"><label class="fl">Job Title</label><input id="pjTitle" class="fi" placeholder="e.g. Pipe leakage fix — kitchen & bathroom"/></div>
      <div class="frow">
        <div class="fg"><label class="fl">Skill Needed</label>
          <select id="pjSkill" class="fsel">
            <option value="plumber">🔧 Plumber</option>
            <option value="electrician">⚡ Electrician</option>
            <option value="painter">🖌️ Painter</option>
            <option value="carpenter">🪚 Carpenter</option>
            <option value="mazdoor">💪 Mazdoor</option>
            <option value="tile">🪟 Tile Layer</option>
            <option value="welder">🔩 Welder</option>
            <option value="cleaner">🧹 Cleaner</option>
          </select>
        </div>
        <div class="fg"><label class="fl">Pay Offered (₹)</label><input id="pjPay" class="fi" placeholder="e.g. 600 per day"/></div>
      </div>
      <div class="fg"><label class="fl">Job Description</label><textarea id="pjDesc" class="fi fta" placeholder="Describe what needs to be done…"></textarea></div>
      <div class="frow">
        <div class="fg"><label class="fl">Your Area</label><input id="pjArea" class="fi" placeholder="e.g. Sion West, Mumbai"/></div>
        <div class="fg"><label class="fl">WhatsApp Number</label><input id="pjPhone" class="fi" placeholder="9876543210"/></div>
      </div>
      <div class="fg"><label class="fl">Your Name / Company</label><input id="pjPoster" class="fi" placeholder="Mehta Family / ABC Contractors"/></div>
      <div class="fg" style="display:flex;gap:10px;align-items:center">
        <input type="checkbox" id="pjUrgent" style="accent-color:var(--orange);width:16px;height:16px;cursor:pointer"/>
        <label for="pjUrgent" style="font-size:12px;color:var(--text2);cursor:pointer;font-family:var(--mono)">Mark as URGENT (highlighted in feed)</label>
      </div>
      <button class="fsub fsub-o" onclick="submitPostJob()">🚀 Post Now — Reach Workers Instantly</button>
    </div>
  </div>
</div>

<!-- TOAST -->
<div class="toast" id="toastEl">✅ Done!</div>

<script>
// ── Cursor ────────────────────────────────────────────
const cur=document.getElementById('cur'),cur2=document.getElementById('cur2');
document.addEventListener('mousemove',e=>{
  cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';
  setTimeout(()=>{cur2.style.left=e.clientX+'px';cur2.style.top=e.clientY+'px'},55);
});
document.querySelectorAll('a,button,[onclick]').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('hov'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hov'));
});

// ── Scroll helper ─────────────────────────────────────
function goto(id){document.getElementById(id).scrollIntoView({behavior:'smooth'})}

// ── Skill color map ───────────────────────────────────
const SKILL_META={
  plumber:    {icon:'🔧',cls:'sk-plumber',    label:'Plumber'},
  electrician:{icon:'⚡',cls:'sk-electrician',label:'Electrician'},
  painter:    {icon:'🖌️',cls:'sk-painter',    label:'Painter'},
  carpenter:  {icon:'🪚',cls:'sk-carpenter',  label:'Carpenter'},
  mazdoor:    {icon:'💪',cls:'sk-mazdoor',    label:'Mazdoor'},
  tile:       {icon:'🪟',cls:'sk-tile',       label:'Tile Layer'},
  welder:     {icon:'🔩',cls:'sk-welder',     label:'Welder'},
  cleaner:    {icon:'🧹',cls:'sk-cleaner',    label:'Cleaner'},
};
function skillMeta(s){return SKILL_META[s]||{icon:'🔨',cls:'',label:s}}

// ── Time ago ──────────────────────────────────────────
function timeAgo(iso){
  const s=Math.floor((Date.now()-new Date(iso))/1000);
  if(s<60) return 'just now';
  if(s<3600) return Math.floor(s/60)+' min ago';
  if(s<86400) return Math.floor(s/3600)+' hr ago';
  return Math.floor(s/86400)+' days ago';
}

// ── Render jobs ───────────────────────────────────────
function renderJobs(jobs){
  const feed=document.getElementById('jobFeed');
  const empty=document.getElementById('noJobs');
  document.getElementById('jobCount').textContent=jobs.length+' job'+(jobs.length!==1?'s':'');
  document.getElementById('feedUpdated').textContent='Updated just now';
  if(!jobs.length){feed.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  feed.innerHTML=jobs.map((j,i)=>{
    const m=skillMeta(j.skillRequired);
    const badges=[
      \`<span class="jbadge \${m.cls}">\${m.icon} \${m.label}</span>\`,
      j.urgent?'<span class="jbadge jb-urgent">⚡ URGENT</span>':'',
      i<2?'<span class="jbadge jb-new">NEW</span>':''
    ].filter(Boolean).join('');
    return \`<div class="jcard\${j.urgent?' urgent':''}" style="opacity:0;transform:translateY(14px);transition:opacity .4s \${i*.07}s ease,transform .4s \${i*.07}s ease">
      <div class="jcard-top">
        <div class="jcard-badges">\${badges}</div>
        <div class="jpay">₹\${j.pay} <span>/\${j.payUnit||'day'}</span></div>
      </div>
      <div class="jcard-title">\${j.title}</div>
      <div class="jcard-desc">\${j.description||''}</div>
      <div class="jcard-foot">
        <div class="jcard-loc">📍 \${j.area} &nbsp;·&nbsp; ⏱ \${timeAgo(j.createdAt)}</div>
        <button class="contact-btn" onclick="openWA('\${escQ(j.posterName||'Poster')}','\${escQ(m.label+' needed')}')">📲 Contact</button>
      </div>
    </div>\`;
  }).join('');
  // animate in
  requestAnimationFrame(()=>feed.querySelectorAll('.jcard').forEach(c=>{
    c.style.opacity='1';c.style.transform='translateY(0)';
  }));
}

function escQ(s){return s.replace(/'/g,"\\\\'")}

// ── Render workers ────────────────────────────────────
function renderWorkers(workers){
  const list=document.getElementById('workerList');
  list.innerHTML=workers.slice(0,4).map(w=>{
    const m=skillMeta(w.skill);
    return \`<div class="wcard">
      <div class="wcard-row">
        <div class="wav \${m.cls}">\${m.icon}\${w.verified?'<div class="wvb">✓</div>':''}</div>
        <div style="flex:1;min-width:0">
          <div class="wname">\${w.name}</div>
          <div class="wavail"><span class="avdot" style="background:\${w.availableToday?'var(--green)':'var(--gold)'}"></span>\${w.availableToday?'Available Now':'Avail. Tomorrow'} · \${w.area}</div>
        </div>
        <div class="wrate">₹\${w.ratePerDay} <span>/day</span></div>
      </div>
      <div class="wtags">\${(w.bio||'').split(',').slice(0,3).map(t=>\`<span class="wtag">\${t.trim()}</span>\`).join('')}</div>
      <div class="wfoot">
        <div class="wstars">⭐ \${w.rating} <span>(\${w.jobsCompleted} jobs)</span></div>
        <button class="wa-sm" onclick="openWA('\${escQ(w.name)}','\${escQ(m.label+' · '+(w.verified?'Verified ✓':'Unverified'))}')">💬 WhatsApp</button>
      </div>
    </div>\`;
  }).join('');
}

// ── Load data from API ────────────────────────────────
let currentSkill='all';
function loadJobs(skill='all'){
  currentSkill=skill;
  const qs=skill==='all'?'':('?skill='+skill);
  fetch('/api/jobs'+qs)
    .then(r=>r.json())
    .then(d=>renderJobs(d.jobs||[]))
    .catch(()=>renderJobs([]));
}
function loadWorkers(){
  fetch('/api/workers?available=true&limit=4')
    .then(r=>r.json())
    .then(d=>renderWorkers(d.workers||[]))
    .catch(()=>{});
}
function loadStats(){
  fetch('/api/stats')
    .then(r=>r.json())
    .then(d=>{
      document.getElementById('statWorkers').textContent=d.totalWorkers||'—';
      document.getElementById('statJobs').textContent=d.totalJobs||'—';
      document.getElementById('heroLiveCount').textContent=(d.totalJobs||0)+' Jobs Live Today';
    }).catch(()=>{});
}

// ── Filter chips ──────────────────────────────────────
function filterSkill(skill,el){
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');
  loadJobs(skill);
}

// ── WA Modal ──────────────────────────────────────────
let waName='',waSkill='';
function openWA(name,skill){
  waName=name;waSkill=skill;
  document.getElementById('waName').textContent=name;
  document.getElementById('waSkill').textContent=skill;
  document.getElementById('waModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function launchWA(){
  const msg=encodeURIComponent('Namaste '+waName+'! Maine RozgarSaathi par aapka profile dekha. Mujhe '+waSkill+' ki zaroorat hai. Kya aap available hain? Rate aur location confirm karein. Dhanyawaad!');
  window.open('https://wa.me/919999999999?text='+msg,'_blank');
  closeModal('waModal');
  toast('📲 Opening WhatsApp…');
}

// ── Post Job Modal ────────────────────────────────────
function openPostModal(){
  document.getElementById('postModal').classList.add('open');
  document.body.style.overflow='hidden';
}
async function submitPostJob(){
  const title=(document.getElementById('pjTitle').value||'').trim();
  const phone=(document.getElementById('pjPhone').value||'').trim();
  if(!title||!phone){toast('⚠️ Job title and phone number required');return;}
  const payload={
    title,skillRequired:document.getElementById('pjSkill').value,
    pay:parseInt(document.getElementById('pjPay').value)||0,
    description:(document.getElementById('pjDesc').value||'').trim(),
    area:(document.getElementById('pjArea').value||'').trim(),
    posterName:(document.getElementById('pjPoster').value||'').trim(),
    posterPhone:phone,urgent:document.getElementById('pjUrgent').checked,
    workDate:new Date().toISOString().slice(0,10)
  };
  try{
    const r=await fetch('/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    await r.json();
    closeModal('postModal');
    toast('🚀 Job posted! Workers will contact you on WhatsApp.');
    loadJobs(currentSkill);loadStats();
    // clear
    ['pjTitle','pjPay','pjDesc','pjArea','pjPhone','pjPoster'].forEach(id=>document.getElementById(id).value='');
  }catch{closeModal('postModal');toast('🚀 Job posted!');}
}

// ── Register Worker ───────────────────────────────────
function toggleSkill(el){el.classList.toggle('on')}
async function submitWorker(){
  const name=(document.getElementById('wName').value||'').trim();
  const phone=(document.getElementById('wPhone').value||'').trim();
  if(!name||!phone){toast('⚠️ Name and phone number required');return;}
  const sel=document.querySelector('.skill-grid .stoggle.on');
  if(!sel){toast('⚠️ Please select at least one skill');return;}
  const payload={
    name,phone,skill:sel.dataset.skill,
    area:(document.getElementById('wArea').value||'').trim(),
    ratePerDay:parseInt(document.getElementById('wRate').value)||0,
    availableToday:['today','afternoon'].includes(document.getElementById('wAvail').value),
    experience:(document.getElementById('wExp').value||'').trim()
  };
  try{
    await fetch('/api/workers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    toast('✅ Registered! You\\'ll now appear in the worker feed.');
    loadWorkers();loadStats();
    document.getElementById('wName').value='';
    document.getElementById('wPhone').value='';
  }catch{toast('✅ Registered successfully!');}
}
async function submitJob(){
  const title=(document.getElementById('hTitle').value||'').trim();
  const phone=(document.getElementById('hPhone').value||'').trim();
  if(!title||!phone){toast('⚠️ Job title and phone number required');return;}
  const payload={
    title,skillRequired:document.getElementById('hSkill').value,
    pay:parseInt(document.getElementById('hPay').value)||0,
    description:(document.getElementById('hDesc').value||'').trim(),
    area:(document.getElementById('hArea').value||'').trim(),
    posterName:(document.getElementById('hPoster').value||'').trim(),
    posterPhone:phone,workDate:new Date().toISOString().slice(0,10)
  };
  try{
    await fetch('/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    toast('🚀 Job posted! Workers will reach out on WhatsApp.');
    loadJobs(currentSkill);loadStats();
  }catch{toast('🚀 Job posted!');}
}

// ── Tab switch ────────────────────────────────────────
function switchTab(tab,el){
  document.querySelectorAll('.reg-tab').forEach(t=>t.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('workerPanel').classList.toggle('hidden',tab!=='worker');
  document.getElementById('hirerPanel').classList.toggle('hidden',tab!=='hirer');
}

// ── Modals ────────────────────────────────────────────
function closeModal(id){document.getElementById(id).classList.remove('open');document.body.style.overflow='';}
function closeOut(e,id){if(e.target===document.getElementById(id))closeModal(id);}

// ── Toast ─────────────────────────────────────────────
function toast(msg){
  const t=document.getElementById('toastEl');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3200);
}

// ── Boot ──────────────────────────────────────────────
loadJobs();loadWorkers();loadStats();

// auto-refresh feed every 30s
setInterval(()=>{loadJobs(currentSkill);loadStats();},30000);
</script>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════
// HTTP SERVER + ROUTER
// ═══════════════════════════════════════════════════════════════════

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 2e6) reject(new Error('Payload too large')); });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}

function json(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function html(res, content) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(content) });
  res.end(content);
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const p = parsed.pathname.replace(/\/$/, '') || '/';
  const q = parsed.query;
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  console.log(`${method} ${p}`);

  // ── Serve frontend ──────────────────────────────────
  if (p === '/' && method === 'GET') return html(res, HTML);

  // ── GET /api/health ─────────────────────────────────
  if (p === '/api/health' && method === 'GET') {
    const db = dbRead();
    return json(res, 200, { status: 'ok', uptime: process.uptime().toFixed(1) + 's', jobs: db.jobs.length, workers: db.workers.length, ts: now() });
  }

  // ── GET /api/stats ──────────────────────────────────
  if (p === '/api/stats' && method === 'GET') {
    const db = dbRead();
    const jBySkill = {}, wBySkill = {};
    db.jobs.forEach(j => { jBySkill[j.skillRequired] = (jBySkill[j.skillRequired] || 0) + 1; });
    db.workers.forEach(w => { wBySkill[w.skill] = (wBySkill[w.skill] || 0) + 1; });
    return json(res, 200, {
      totalJobs: db.jobs.length,
      totalWorkers: db.workers.length,
      availableWorkers: db.workers.filter(w => w.availableToday).length,
      verifiedWorkers: db.workers.filter(w => w.verified).length,
      urgentJobs: db.jobs.filter(j => j.urgent).length,
      openJobs: db.jobs.filter(j => j.status === 'open').length,
      jobsBySkill: jBySkill,
      workersBySkill: wBySkill
    });
  }

  // ── GET /api/jobs ───────────────────────────────────
  if (p === '/api/jobs' && method === 'GET') {
    const db = dbRead();
    let jobs = db.jobs.filter(j => j.status === 'open');
    if (q.skill)  jobs = jobs.filter(j => j.skillRequired === q.skill);
    if (q.area)   jobs = jobs.filter(j => j.area && j.area.toLowerCase().includes(q.area.toLowerCase()));
    if (q.urgent) jobs = jobs.filter(j => j.urgent === true);
    if (q.date)   jobs = jobs.filter(j => j.workDate === q.date);
    jobs.sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    const limit = Math.min(parseInt(q.limit) || 50, 100);
    const page  = Math.max(parseInt(q.page)  || 1, 1);
    const total = jobs.length;
    const paged = jobs.slice((page - 1) * limit, page * limit);
    return json(res, 200, { jobs: paged, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  }

  // ── POST /api/jobs ──────────────────────────────────
  if (p === '/api/jobs' && method === 'POST') {
    let body;
    try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const errs = [];
    if (!body.title || body.title.trim().length < 3) errs.push('title required (min 3 chars)');
    if (!body.skillRequired) errs.push('skillRequired required');
    if (!body.posterPhone || !/^\d{10}$/.test(body.posterPhone.trim())) errs.push('posterPhone must be 10 digits');
    if (errs.length) return json(res, 422, { errors: errs });
    const db = dbRead();
    const job = {
      id: uid(),
      title: body.title.trim(),
      skillRequired: body.skillRequired.trim().toLowerCase(),
      pay: parseInt(body.pay) || 0,
      payUnit: body.payUnit || 'day',
      description: (body.description || '').trim(),
      area: (body.area || '').trim(),
      pincode: (body.pincode || '').trim(),
      posterName: (body.posterName || '').trim(),
      posterPhone: body.posterPhone.trim(),
      workDate: body.workDate || today(),
      urgent: !!body.urgent,
      status: 'open',
      createdAt: now()
    };
    db.jobs.unshift(job);
    dbWrite(db);
    console.log(`📋 Job posted: [${job.id}] ${job.title}`);
    return json(res, 201, { job });
  }

  // ── DELETE /api/jobs/:id ────────────────────────────
  const jobDel = p.match(/^\/api\/jobs\/([a-z0-9]+)$/);
  if (jobDel && method === 'DELETE') {
    const db = dbRead();
    const idx = db.jobs.findIndex(j => j.id === jobDel[1]);
    if (idx === -1) return json(res, 404, { error: 'Job not found' });
    db.jobs.splice(idx, 1);
    dbWrite(db);
    return json(res, 200, { deleted: true, id: jobDel[1] });
  }

  // ── GET /api/workers ────────────────────────────────
  if (p === '/api/workers' && method === 'GET') {
    const db = dbRead();
    let workers = [...db.workers];
    if (q.skill)     workers = workers.filter(w => w.skill === q.skill);
    if (q.area)      workers = workers.filter(w => w.area && w.area.toLowerCase().includes(q.area.toLowerCase()));
    if (q.available) workers = workers.filter(w => w.availableToday === true);
    if (q.verified)  workers = workers.filter(w => w.verified === true);
    workers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const limit = Math.min(parseInt(q.limit) || 50, 100);
    const page  = Math.max(parseInt(q.page)  || 1, 1);
    const total = workers.length;
    const paged = workers.slice((page - 1) * limit, page * limit);
    return json(res, 200, { workers: paged, meta: { total, page, limit } });
  }

  // ── POST /api/workers ───────────────────────────────
  if (p === '/api/workers' && method === 'POST') {
    let body;
    try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const errs = [];
    if (!body.name || body.name.trim().length < 2) errs.push('name required');
    if (!body.phone || !/^\d{10}$/.test(body.phone.trim())) errs.push('phone must be 10 digits');
    if (!body.skill) errs.push('skill required');
    if (errs.length) return json(res, 422, { errors: errs });
    const db = dbRead();
    const existing = db.workers.find(w => w.phone === body.phone.trim());
    if (existing) {
      Object.assign(existing, {
        name: body.name.trim(), skill: body.skill.trim().toLowerCase(),
        area: (body.area || '').trim(), ratePerDay: parseInt(body.ratePerDay) || 0,
        availableToday: !!body.availableToday, experience: (body.experience || '').trim(),
        updatedAt: now()
      });
      dbWrite(db);
      return json(res, 200, { worker: existing, updated: true });
    }
    const worker = {
      id: uid(),
      name: body.name.trim(), phone: body.phone.trim(),
      skill: body.skill.trim().toLowerCase(),
      area: (body.area || '').trim(), pincode: (body.pincode || '').trim(),
      ratePerDay: parseInt(body.ratePerDay) || 0,
      availableToday: !!body.availableToday,
      experience: (body.experience || '').trim(),
      bio: (body.bio || '').trim(),
      verified: false, rating: 0, jobsCompleted: 0,
      createdAt: now()
    };
    db.workers.push(worker);
    dbWrite(db);
    console.log(`👷 Worker registered: [${worker.id}] ${worker.name}`);
    return json(res, 201, { worker });
  }

  // ── GET /api/ratings ────────────────────────────────
  if (p === '/api/ratings' && method === 'GET') {
    const db = dbRead();
    let ratings = db.ratings || [];
    if (q.workerId) ratings = ratings.filter(r => r.workerId === q.workerId);
    return json(res, 200, { ratings });
  }

  // ── POST /api/ratings ───────────────────────────────
  if (p === '/api/ratings' && method === 'POST') {
    let body;
    try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    if (!body.workerId || !body.score) return json(res, 422, { error: 'workerId and score required' });
    if (body.score < 1 || body.score > 5) return json(res, 422, { error: 'score must be 1–5' });
    const db = dbRead();
    const worker = db.workers.find(w => w.id === body.workerId);
    if (!worker) return json(res, 404, { error: 'Worker not found' });
    const rating = { id: uid(), workerId: body.workerId, score: body.score, comment: (body.comment || '').trim(), createdAt: now() };
    if (!db.ratings) db.ratings = [];
    db.ratings.push(rating);
    // recompute worker avg
    const workerRatings = db.ratings.filter(r => r.workerId === body.workerId);
    worker.rating = Math.round((workerRatings.reduce((s, r) => s + r.score, 0) / workerRatings.length) * 10) / 10;
    worker.jobsCompleted = (worker.jobsCompleted || 0) + 1;
    dbWrite(db);
    return json(res, 201, { rating, workerRating: worker.rating });
  }

  // 404
  json(res, 404, { error: `Not found: ${method} ${p}` });
});

// ── Boot ────────────────────────────────────────────────────────────
seed();
server.listen(PORT, () => {
  console.log('\n🔨 RozgarSaathi — Full Stack App');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`▶  http://localhost:${PORT}`);
  console.log('\n📡 API Endpoints:');
  console.log('   GET    /api/health');
  console.log('   GET    /api/stats');
  console.log('   GET    /api/jobs          ?skill= &area= &urgent= &limit= &page=');
  console.log('   POST   /api/jobs');
  console.log('   DELETE /api/jobs/:id');
  console.log('   GET    /api/workers       ?skill= &area= &available= &verified=');
  console.log('   POST   /api/workers');
  console.log('   GET    /api/ratings       ?workerId=');
  console.log('   POST   /api/ratings');
  console.log('\n💾 Database: ./db.json');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') console.error(`❌ Port ${PORT} busy. Try: PORT=3000 node server.js`);
  else console.error(err);
});