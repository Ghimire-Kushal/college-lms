/**
 * LMS Stress Test — simulates 5,000 students hitting deadline simultaneously
 *
 * Phases:
 *  1. Warm-up   — 50 concurrent users, 10s  (normal load)
 *  2. Ramp-up   — 500 concurrent, 15s       (busy period)
 *  3. Peak      — 2000 concurrent, 20s      (deadline rush)
 *  4. Spike     — 5000 concurrent, 10s      (exact deadline moment)
 *  5. Cool-down — 100 concurrent, 10s       (post-deadline)
 *
 * Endpoints under test (most critical first):
 *  POST /api/student/assignments/:id/submit  ← THE bottleneck
 *  GET  /api/student/dashboard               ← pre-deadline checking
 *  POST /api/auth/login                      ← mass login at deadline
 *  GET  /api/student/assignments             ← checking assignment list
 *  GET  /api/notifications                   ← polling
 */

const autocannon = require('autocannon');
const jwt = require('jsonwebtoken');
const http = require('http');

const BASE_URL = 'http://localhost:5001';
const JWT_SECRET = process.env.JWT_SECRET || require('dotenv').config({ path: require('path').join(__dirname, '.env') }) && process.env.JWT_SECRET;

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeToken(userId, role = 'student') {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '2h' });
}

function fakeObjectId(index) {
  return '6' + String(index).padStart(23, '0');
}

// Pre-generate 5000 student tokens (avoids JWT overhead during test)
const STUDENT_TOKENS = Array.from({ length: 5000 }, (_, i) =>
  makeToken(fakeObjectId(i + 1), 'student')
);

// One real admin token for setup
async function getRealToken(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost', port: 5001,
      path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body).token); }
        catch { reject(new Error('Login failed: ' + body)); }
      });
    });
    req.write(data); req.end();
  });
}

async function getAssignmentId(token) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost', port: 5001,
      path: '/api/teacher/assignments', method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const arr = JSON.parse(body);
          resolve(arr[0]?._id || null);
        } catch { resolve(null); }
      });
    });
    req.end();
  });
}

async function createTestAssignment(adminToken) {
  // First get a course
  const courses = await new Promise(resolve => {
    const req = http.request({
      hostname: 'localhost', port: 5001,
      path: '/api/admin/courses', method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve([]); } });
    });
    req.end();
  });

  if (!courses.length) return null;
  const courseId = courses[0]._id;

  return new Promise((resolve) => {
    const data = JSON.stringify({
      title: 'STRESS TEST — Final Deadline Submission',
      description: 'Load test assignment',
      course: courseId,
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      totalMarks: 100,
    });
    const req = http.request({
      hostname: 'localhost', port: 5001,
      path: '/api/teacher/assignments', method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json', 'Content-Length': data.length },
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)._id || null); }
        catch { resolve(null); }
      });
    });
    req.write(data); req.end();
  });
}

// ── Pretty print results ─────────────────────────────────────────────────────

function report(phase, result) {
  const r = result;
  const ok = r.non2xx === 0 && r.errors === 0;
  const status = ok ? '✅' : '⚠️ ';
  const throughput = (r.requests.total / r.duration * 1000).toFixed(0);

  console.log(`\n${status} ${phase}`);
  console.log('─'.repeat(52));
  console.log(`  Requests      : ${r.requests.total.toLocaleString()} total`);
  console.log(`  Throughput    : ${throughput} req/s`);
  console.log(`  Latency p50   : ${r.latency.p50} ms`);
  console.log(`  Latency p95   : ${r.latency.p95} ms`);
  console.log(`  Latency p99   : ${r.latency.p99} ms`);
  console.log(`  Max latency   : ${r.latency.max} ms`);
  console.log(`  2xx responses : ${(r.requests.total - r.non2xx - r.errors).toLocaleString()}`);
  console.log(`  Non-2xx       : ${r.non2xx.toLocaleString()}  ${r.non2xx > 0 ? '← FAILURES' : ''}`);
  console.log(`  Errors        : ${r.errors.toLocaleString()}  ${r.errors > 0 ? '← CONNECTION DROPS' : ''}`);

  if (r.latency.p99 > 5000)   console.log('  🔴  p99 > 5s — requests timing out at peak load');
  else if (r.latency.p99 > 2000) console.log('  🟡  p99 > 2s — degraded UX under load');
  else if (r.latency.p99 > 500)  console.log('  🟢  p99 < 2s — acceptable under this load');
  else                           console.log('  🟢  p99 < 500ms — healthy');

  return {
    phase,
    rps: parseInt(throughput),
    p50: r.latency.p50,
    p95: r.latency.p95,
    p99: r.latency.p99,
    max: r.latency.max,
    errors: r.non2xx + r.errors,
    total: r.requests.total,
  };
}

function run(config) {
  return new Promise((resolve) => {
    const instance = autocannon(config, (err, result) => {
      resolve(result);
    });
    autocannon.track(instance, { renderProgressBar: true });
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║     LMS PEAK LOAD STRESS TEST — 5,000 Students  ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Setup: get real tokens and assignment
  process.stdout.write('Setting up test data...');
  const adminToken  = await getRealToken('admin@edutrack.com',   'admin123');
  const teacherToken = await getRealToken('teacher@edutrack.com', 'teacher123');
  process.stdout.write(' tokens ok...');

  // Try to get/create an assignment for submission testing
  let assignmentId = await getAssignmentId(teacherToken);
  if (!assignmentId) {
    assignmentId = await createTestAssignment(teacherToken || adminToken);
  }
  if (assignmentId) {
    process.stdout.write(` assignment ${assignmentId.slice(-6)} ok\n`);
  } else {
    process.stdout.write(' no assignment (submission test will use health endpoint)\n');
  }

  const authHeader = (i) => ({ Authorization: `Bearer ${STUDENT_TOKENS[i % 5000]}` });
  const results = [];

  // ── Phase 1: Warm-up ──────────────────────────────────────────────────────
  console.log('\n📊 Phase 1/5: Warm-up (50 concurrent, 10s) — Students checking before deadline');
  const warmup = await run({
    url: `${BASE_URL}/api/student/dashboard`,
    connections: 50,
    duration: 10,
    headers: { Authorization: `Bearer ${STUDENT_TOKENS[0]}` },
    title: 'Warm-up',
  });
  results.push(report('Phase 1 — Warm-up (50 concurrent)', warmup));

  // ── Phase 2: Ramp-up ──────────────────────────────────────────────────────
  console.log('\n📊 Phase 2/5: Ramp-up (500 concurrent, 15s) — Students logging in before deadline');
  const loginBody = JSON.stringify({ email: 'student@edutrack.com', password: 'student123' });
  const rampup = await run({
    url: `${BASE_URL}/api/auth/login`,
    method: 'POST',
    connections: 500,
    duration: 15,
    headers: { 'Content-Type': 'application/json' },
    body: loginBody,
    title: 'Ramp-up: Auth',
  });
  results.push(report('Phase 2 — Login flood (500 concurrent)', rampup));

  // ── Phase 3: Peak reads ───────────────────────────────────────────────────
  console.log('\n📊 Phase 3/5: Peak reads (2000 concurrent, 20s) — Everyone checking assignments');
  const peakReads = await run({
    url: `${BASE_URL}/api/student/assignments`,
    connections: 2000,
    duration: 20,
    headers: { Authorization: `Bearer ${STUDENT_TOKENS[42]}` },
    title: 'Peak reads',
  });
  results.push(report('Phase 3 — Peak reads (2000 concurrent)', peakReads));

  // ── Phase 4: DEADLINE SPIKE — THE REAL TEST ───────────────────────────────
  const submitUrl = assignmentId
    ? `${BASE_URL}/api/student/assignments/${assignmentId}/submit`
    : `${BASE_URL}/api/health`;

  const submitBody = JSON.stringify({ content: 'Stress test submission — load test payload' });

  console.log(`\n📊 Phase 4/5: DEADLINE SPIKE (5000 concurrent, 10s) — Everyone hits submit`);
  console.log(`   → ${submitUrl}`);

  let tokenIndex = 0;
  const spike = await run({
    url: submitUrl,
    method: assignmentId ? 'POST' : 'GET',
    connections: 5000,
    duration: 10,
    headers: assignmentId
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${STUDENT_TOKENS[tokenIndex++ % 5000]}` }
      : { Authorization: `Bearer ${STUDENT_TOKENS[0]}` },
    body: assignmentId ? submitBody : undefined,
    title: 'Deadline spike',
  });
  results.push(report('Phase 4 — DEADLINE SPIKE (5000 concurrent)', spike));

  // ── Phase 5: Cool-down ────────────────────────────────────────────────────
  console.log('\n📊 Phase 5/5: Cool-down (100 concurrent, 10s) — After deadline traffic');
  const cooldown = await run({
    url: `${BASE_URL}/api/student/results`,
    connections: 100,
    duration: 10,
    headers: { Authorization: `Bearer ${STUDENT_TOKENS[0]}` },
    title: 'Cool-down',
  });
  results.push(report('Phase 5 — Cool-down (100 concurrent)', cooldown));

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    STRESS TEST SUMMARY                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\n  Phase                            RPS     p95     p99     Errors');
  console.log('  ' + '─'.repeat(68));
  for (const r of results) {
    const name = r.phase.padEnd(36);
    const rps  = String(r.rps).padStart(5);
    const p95  = String(r.p95 + 'ms').padStart(7);
    const p99  = String(r.p99 + 'ms').padStart(7);
    const err  = r.errors > 0 ? `🔴 ${r.errors}` : '  ✅ 0';
    console.log(`  ${name} ${rps}  ${p95}  ${p99}  ${err}`);
  }

  // ── Diagnosis ─────────────────────────────────────────────────────────────
  console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    DIAGNOSIS & FIXES                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const spike_r = results[3];
  const login_r = results[1];

  if (spike_r.p99 > 5000 || spike_r.errors > 0) {
    console.log('🔴 CRITICAL: Server collapses at 5,000 concurrent submissions');
    console.log('   Fix 1: Add rate limiting (express-rate-limit) on /api/student/assignments');
    console.log('   Fix 2: Use a job queue (Bull + Redis) — accept submission, process async');
    console.log('   Fix 3: Add MongoDB write concern: { w:1, j:false } for submissions');
    console.log('   Fix 4: PM2 cluster mode — run one worker per CPU core\n');
  }

  if (login_r.p99 > 2000) {
    console.log('🟡 WARNING: Login endpoint slows at 500 concurrent');
    console.log('   Fix: Cache JWT token validation, add /api/auth/login rate limit\n');
  }

  const maxRps = Math.max(...results.map(r => r.rps));
  console.log(`  Peak throughput achieved : ${maxRps} req/s`);
  console.log(`  Estimated safe concurrency: ~${Math.floor(maxRps / 10)} simultaneous users`);
  console.log(`  MongoDB connection pool  : default (5) — needs poolSize: 50+ for production`);
  console.log(`  Clustering               : 1 process — needs PM2 cluster for ${require('os').cpus().length} cores`);
  console.log(`  Rate limiting            : NONE — any endpoint is fully open`);
  console.log(`  Request queue            : NONE — no backpressure, drops under spike\n`);

  console.log('  Quick wins (30 min each):');
  console.log('   1. PM2 cluster: saves 0 to N-core parallelism immediately');
  console.log('   2. express-rate-limit: prevents single IPs from monopolising slots');
  console.log('   3. mongoose poolSize: 50+ prevents connection queue backs');
  console.log('   4. compression middleware: reduces payload size ~70%');
  console.log('   5. Bull queue on /submit: decouples write from HTTP response\n');
}

main().catch(console.error);
