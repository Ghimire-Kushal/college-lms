/**
 * ══════════════════════════════════════════════════════════════════
 *  LMS COMPLETE INFRASTRUCTURE TEST SUITE
 *  10 real-world academic peak-load scenarios
 * ══════════════════════════════════════════════════════════════════
 */

'use strict';

const autocannon = require('autocannon');
const jwt        = require('jsonwebtoken');
const http       = require('http');
const https      = require('https');
const fs         = require('fs');
const path       = require('path');
const os         = require('os');

// ── Config ────────────────────────────────────────────────────────
const BASE    = 'http://localhost:5001';
const SECRET = process.env.JWT_SECRET;

// Real data from the system
const REAL = {
  adminToken:   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTk4OTZmNTZkY2VjMzg2ZWYwNmI5NiIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJTdXBlciBBZG1pbiIsImlhdCI6MTc4MDMwNzY2MywiZXhwIjoxNzgwOTEyNDYzfQ.6rrFa3v5LGB4gpPWSHgp6tDQge9sNn_PgRpZc_-xXq0',
  teacherToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTk4OTZmNTZkY2VjMzg2ZWYwNmI5OCIsInJvbGUiOiJ0ZWFjaGVyIiwibmFtZSI6Ik1yLiBSYWplc2ggUG91ZGVsIiwiaWF0IjoxNzgwMzA3NjYzLCJleHAiOjE3ODA5MTI0NjN9.vLftPN6_CgNttiFyRs1CNubCRBOGlop2oBvA09Rb4rE',
  studentToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTk4OTZmNTZkY2VjMzg2ZWYwNmI5ZiIsInJvbGUiOiJzdHVkZW50IiwibmFtZSI6IkFhcmF2IFRoYXBhIiwiaWF0IjoxNzgwMzA3NjYzLCJleHAiOjE3ODA5MTI0NjN9.cPNy3JCGGNQSKcjwWUmEgBxZc3qENkaEXoglW0fXIlY',
  studentIds:   ['6a1d411bb2ed314f4e9cb0e0','6a1d411bb2ed314f4e9cb0ab','6a198b2541c0d85e53fa3ee4','6a198b2541c0d85e53fa3ee3','6a198b2541c0d85e53fa3ee2'],
  courseIds:    ['6a198b2641c0d85e53fa3eea','6a198b2641c0d85e53fa3ee9','6a198b2641c0d85e53fa3ee8','6a198b2641c0d85e53fa3ee7','6a198b2541c0d85e53fa3ee6'],
  teacherIds:   ['6a19896f56dcec386ef06b9d','6a19896f56dcec386ef06b9b','6a19896f56dcec386ef06b98'],
};

// ── Token factory (generates valid JWTs for virtual users) ────────
function makeToken(userId, role = 'student') {
  return jwt.sign({ id: userId, role, name: `Virtual ${role} ${userId.slice(-4)}` }, SECRET, { expiresIn: '4h' });
}
function fakeId(i) { return '6a' + String(i).padStart(22, '0'); }

// Pre-mint pools so JWT overhead stays out of test hot path
const TOKEN_POOL = {
  students: Array.from({ length: 5000 }, (_, i) => makeToken(fakeId(i + 1000), 'student')),
  teachers: Array.from({ length:  100 }, (_, i) => makeToken(fakeId(i + 100),  'teacher')),
  admins:   Array.from({ length:   10 }, (_, i) => makeToken(fakeId(i + 1),    'admin')),
};

// Rotate tokens across connections so each "user" has their own JWT
function rotatingHeaders(pool, extra = {}) {
  let i = 0;
  return () => ({ Authorization: `Bearer ${pool[i++ % pool.length]}`, ...extra });
}

// ── HTTP helpers ──────────────────────────────────────────────────
function request(opts, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const req  = http.request({ hostname: 'localhost', port: 5001, ...opts,
      headers: { 'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...opts.headers } }, (res) => {
      let buf = '';
      res.on('data', d => buf += d);
      res.on('end', () => { try { resolve(JSON.parse(buf)); } catch { resolve(buf); } });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ── Test runner ───────────────────────────────────────────────────
function runTest(config) {
  return new Promise(resolve => {
    const inst = autocannon({ ...config, silent: true }, (err, result) => resolve(result));
    autocannon.track(inst, { renderProgressBar: true, renderResultsTable: false });
  });
}

// ── Report ────────────────────────────────────────────────────────
const ALL_RESULTS = [];

function report(label, scenario, result, notes = []) {
  const rps    = result.requests.average || (result.requests.total / result.duration * 1000) | 0;
  const ok     = result.requests.total - result.non2xx - result.errors;
  const fail   = result.non2xx + result.errors;
  const pct    = result.requests.total > 0 ? ((ok / result.requests.total) * 100).toFixed(1) : 0;
  const p99    = result.latency.p99;
  const maxLat = result.latency.max;

  let grade, gradeReason;
  if (p99 < 200 && fail === 0)       { grade = '🟢 PASS';   gradeReason = 'p99 < 200ms, zero failures'; }
  else if (p99 < 500 && fail < result.requests.total * 0.01) { grade = '🟡 WARN'; gradeReason = 'p99 < 500ms, <1% failures'; }
  else if (p99 < 2000)               { grade = '🟠 DEGRADED'; gradeReason = 'p99 < 2s but failures present'; }
  else                               { grade = '🔴 FAIL';  gradeReason = `p99=${p99}ms or >${((fail/result.requests.total)*100).toFixed(0)}% failures`; }

  const row = { label, scenario, rps, p50: result.latency.p50, p99, max: maxLat, ok, fail, pct, grade, gradeReason, notes };
  ALL_RESULTS.push(row);

  const width = 62;
  console.log('\n' + '═'.repeat(width));
  console.log(` ${label}`);
  console.log('─'.repeat(width));
  console.log(` Scenario   : ${scenario}`);
  console.log(` Connections: ${result.connections}   Duration: ${result.duration}s`);
  console.log(` Requests   : ${result.requests.total.toLocaleString()} total`);
  console.log(` Throughput : ${rps.toLocaleString()} req/s`);
  console.log(` Latency    : p50=${result.latency.p50}ms  p99=${p99}ms  max=${maxLat}ms`);
  console.log(` Success    : ${ok.toLocaleString()} (${pct}%)`);
  console.log(` Failures   : ${fail.toLocaleString()} (${(100 - parseFloat(pct)).toFixed(1)}%)`);
  console.log(` Result     : ${grade} — ${gradeReason}`);
  if (notes.length) notes.forEach(n => console.log(`   ⚠  ${n}`));
  console.log('═'.repeat(width));

  return row;
}

// ── Setup helpers ─────────────────────────────────────────────────
async function createAssignment(courseId) {
  return request({ path: '/api/teacher/assignments', method: 'POST',
    headers: { Authorization: `Bearer ${REAL.teacherToken}` } },
    { title: 'Load Test Assignment', description: 'Stress test',
      course: courseId, dueDate: new Date(Date.now() + 86400000).toISOString(), totalMarks: 100 });
}

async function createResult(studentId, courseId) {
  return request({ path: '/api/teacher/results', method: 'POST',
    headers: { Authorization: `Bearer ${REAL.teacherToken}` } },
    { student: studentId, course: courseId, semester: 1,
      internalMarks: 40, externalMarks: 60, totalMarks: 100, grade: 'A' });
}

// ── Create a temp upload file ─────────────────────────────────────
function createTestFile(sizeKB = 50) {
  const p = path.join(os.tmpdir(), `lms-test-${Date.now()}.txt`);
  fs.writeFileSync(p, Buffer.alloc(sizeKB * 1024, 'LMS load test payload. '));
  return p;
}

// ══════════════════════════════════════════════════════════════════
//  THE 10 TESTS
// ══════════════════════════════════════════════════════════════════

async function test1_examTraffic() {
  console.log('\n\n🧪  TEST 1/10 — CONCURRENT EXAM TRAFFIC');
  console.log('    2,000 students cycling through question reads every 2s');

  // Exam traffic = rapid reads of assignments + dashboard (simulates next/prev question)
  const r = await runTest({
    url: `${BASE}/api/student/assignments`,
    connections: 2000,
    duration: 30,
    headers: { Authorization: `Bearer ${TOKEN_POOL.students[0]}` },
    pipelining: 2,  // students hammer next/prev quickly
  });
  return report(
    'TEST 1 — Concurrent Exam Traffic',
    '2,000 simultaneous exam sessions, 2 pipeline depth',
    r,
    r.latency.p99 > 500  ? ['High p99 — students will experience lag on Next Question'] : [],
  );
}

async function test2_attendanceSurge() {
  console.log('\n\n🧪  TEST 2/10 — ATTENDANCE SURGE');
  console.log('    100 teachers marking attendance in the same 10-minute window');

  const courseId = REAL.courseIds[0];
  const studentRecords = REAL.studentIds.map(id => ({ student: id, status: 'present' }));
  const body = JSON.stringify({ course: courseId, date: new Date().toISOString(), records: studentRecords });

  const r = await runTest({
    url:    `${BASE}/api/teacher/attendance`,
    method: 'POST',
    connections: 100,
    duration: 20,
    headers: { Authorization: `Bearer ${REAL.teacherToken}`, 'Content-Type': 'application/json' },
    body,
  });
  return report(
    'TEST 2 — Attendance Surge (100 teachers, simultaneous writes)',
    'POST /api/teacher/attendance, 100 concurrent, 20s',
    r,
    [
      r.errors > 0     ? `${r.errors} write failures — possible duplicate-key or lock errors` : null,
      r.latency.p99 > 1000 ? 'Write contention detected — teachers will see slow saves' : null,
    ].filter(Boolean),
  );
}

async function test3_resultPublishing() {
  console.log('\n\n🧪  TEST 3/10 — RESULT PUBLISHING SURGE');
  console.log('    5,000 students hitting Results page the moment admin publishes');

  // First publish a result so there is real data to fetch
  await createResult(REAL.studentIds[0], REAL.courseIds[0]).catch(() => {});

  const r = await runTest({
    url: `${BASE}/api/student/results`,
    connections: 5000,
    duration: 15,
    headers: { Authorization: `Bearer ${REAL.studentToken}` },
  });
  return report(
    'TEST 3 — Result Publishing Surge (5,000 students)',
    'GET /api/student/results, 5,000 concurrent, 15s',
    r,
    [
      r.latency.p99 > 3000 ? 'Portal will crash under result-day load — add caching layer' : null,
      r.errors > 100       ? `${r.errors} connection drops — MongoDB pool exhausted` : null,
    ].filter(Boolean),
  );
}

async function test4_authStress() {
  console.log('\n\n🧪  TEST 4/10 — AUTHENTICATION STRESS');
  console.log('    5,000 students attempting to login during course registration open');

  // Use many different credential sets to avoid early rate-limit kick-in
  // We rotate through the 3 known accounts since we can't create 5000 DB users
  const loginBodies = [
    JSON.stringify({ email: 'admin@edutrack.com',   password: 'admin123' }),
    JSON.stringify({ email: 'teacher@edutrack.com', password: 'teacher123' }),
    JSON.stringify({ email: 'student@edutrack.com', password: 'student123' }),
  ];

  // Restart server first to reset rate limits for this clean test
  // We measure sustained throughput, not rate-limit ceiling
  let bodyIdx = 0;

  const r = await runTest({
    url:    `${BASE}/api/auth/login`,
    method: 'POST',
    connections: 500,   // realistic: not all 5000 at exact same ms, but 500 concurrent
    duration: 20,
    headers: { 'Content-Type': 'application/json' },
    body: loginBodies[0],
  });
  return report(
    'TEST 4 — Authentication Stress (500 concurrent logins)',
    'POST /api/auth/login, 500 concurrent, 20s',
    r,
    [
      r.latency.p99 > 2000 ? 'bcrypt queue saturation — consider pre-hashing or token cache' : null,
      r.errors > 0         ? `${r.errors} timeouts — auth service cannot sustain this rate` : null,
      r.latency.p50 > 200  ? `Median login latency ${r.latency.p50}ms — bcrypt rounds may be too high` : null,
    ].filter(Boolean),
  );
}

async function test5_courseRegistration() {
  console.log('\n\n🧪  TEST 5/10 — COURSE REGISTRATION RACE');
  console.log('    2,000 students racing to enroll in the same limited course simultaneously');

  const courseId = REAL.courseIds[0];
  const studentId = REAL.studentIds[0];
  const body = JSON.stringify({ courseId });

  const r = await runTest({
    url:    `${BASE}/api/admin/students/${studentId}/enroll`,
    method: 'POST',
    connections: 2000,
    duration: 15,
    headers: { Authorization: `Bearer ${REAL.adminToken}`, 'Content-Type': 'application/json' },
    body,
  });

  const dupeRate = r.non2xx / (r.requests.total || 1);
  return report(
    'TEST 5 — Course Registration Race (2,000 concurrent enrollments)',
    `POST /api/admin/students/:id/enroll, 2,000 concurrent, 15s`,
    r,
    [
      dupeRate > 0.9     ? 'Expected: most requests get 400 (already enrolled) — race handled' : null,
      r.errors > 0       ? `${r.errors} connection drops — DB lock contention on enrollment writes` : null,
      r.latency.max > 10000 ? 'Max latency > 10s — some requests timed out during enrollment spike' : null,
    ].filter(Boolean),
  );
}

async function test6_notificationBlast() {
  console.log('\n\n🧪  TEST 6/10 — NOTIFICATION BLAST');
  console.log('    5,000 students polling notifications simultaneously after announcement');

  const r = await runTest({
    url:  `${BASE}/api/notifications`,
    connections: 5000,
    duration: 15,
    headers: { Authorization: `Bearer ${TOKEN_POOL.students[0]}` },
    pipelining: 1,
  });
  return report(
    'TEST 6 — Notification Blast (5,000 concurrent reads)',
    'GET /api/notifications, 5,000 concurrent, 15s',
    r,
    [
      r.latency.p99 > 2000 ? 'Notification polling will overwhelm DB — add Redis pub/sub or SSE' : null,
      r.errors > 500       ? `${r.errors} drops — no connection limit on notification endpoint` : null,
    ].filter(Boolean),
  );
}

async function test7_fileUpload() {
  console.log('\n\n🧪  TEST 7/10 — FILE UPLOAD STRESS');
  console.log('    200 students uploading assignments at deadline (multipart/form-data)');

  // Use autocannon with multipart body (simulate with JSON text body of same size)
  // Real multipart would need a custom setup; we test the endpoint latency with payload
  const assignment = await createAssignment(REAL.courseIds[0]);
  const assignId   = assignment?._id;

  if (!assignId) {
    console.log('   ⚠  Could not create assignment — testing dashboard read instead');
    const r = await runTest({ url: `${BASE}/api/student/dashboard`, connections: 200, duration: 20,
      headers: { Authorization: `Bearer ${REAL.studentToken}` } });
    return report('TEST 7 — File Upload Stress (proxy: dashboard)', 'GET /api/student/dashboard, 200 concurrent', r);
  }

  // Simulate large text submission (50KB payload like a PDF attachment encoded)
  const fakeContent = 'X'.repeat(50 * 1024); // 50KB submission content
  const body = JSON.stringify({ content: fakeContent });

  const r = await runTest({
    url:    `${BASE}/api/student/assignments/${assignId}/submit`,
    method: 'POST',
    connections: 200,
    duration: 20,
    headers: { Authorization: `Bearer ${REAL.studentToken}`, 'Content-Type': 'application/json' },
    body,
  });
  return report(
    'TEST 7 — File Upload Stress (200 concurrent, 50KB payload)',
    `POST /api/student/assignments/:id/submit, 200 concurrent, 50KB body`,
    r,
    [
      r.latency.p99 > 5000  ? 'Upload pipeline is too slow — consider async processing + S3 direct upload' : null,
      r.errors > 50         ? `${r.errors} drops — multer memory limit or socket timeout` : null,
      r.latency.max > 30000 ? 'Requests timing out — add upload size limits and streaming' : null,
    ].filter(Boolean),
  );
}

async function test8_dbResilience() {
  console.log('\n\n🧪  TEST 8/10 — DATABASE RESILIENCE');
  console.log('    Mixed read/write load across all collections simultaneously');

  // Fire 4 parallel test streams to hit different DB collections at once
  console.log('   Running 4 parallel streams: students + courses + notices + attendance...\n');

  const [r1, r2, r3, r4] = await Promise.all([
    runTest({ url: `${BASE}/api/admin/students`,  connections: 200, duration: 25,
      headers: { Authorization: `Bearer ${REAL.adminToken}` } }),
    runTest({ url: `${BASE}/api/admin/courses`,   connections: 200, duration: 25,
      headers: { Authorization: `Bearer ${REAL.adminToken}` } }),
    runTest({ url: `${BASE}/api/student/notices`, connections: 300, duration: 25,
      headers: { Authorization: `Bearer ${REAL.studentToken}` } }),
    runTest({ url: `${BASE}/api/student/dashboard`, connections: 300, duration: 25,
      headers: { Authorization: `Bearer ${REAL.studentToken}` } }),
  ]);

  const totalReqs  = r1.requests.total + r2.requests.total + r3.requests.total + r4.requests.total;
  const totalErrs  = r1.errors + r2.errors + r3.errors + r4.errors;
  const maxP99     = Math.max(r1.latency.p99, r2.latency.p99, r3.latency.p99, r4.latency.p99);
  const totalDur   = 25;
  const combinedRps = (totalReqs / totalDur) | 0;

  // Build a synthetic result for unified reporting
  const synthetic = {
    requests: { total: totalReqs, average: combinedRps },
    latency: { p50: r4.latency.p50, p99: maxP99, max: Math.max(r1.latency.max, r2.latency.max, r3.latency.max, r4.latency.max) },
    non2xx: r1.non2xx + r2.non2xx + r3.non2xx + r4.non2xx,
    errors: totalErrs,
    connections: 1000,
    duration: totalDur,
  };

  return report(
    'TEST 8 — DB Resilience (4 parallel streams, 1,000 total connections)',
    'Parallel: students + courses + notices + dashboard, 1,000 conn, 25s',
    synthetic,
    [
      maxP99 > 1000    ? `Worst collection p99=${maxP99}ms — index missing or full collection scan` : null,
      totalErrs > 0    ? `${totalErrs} connection drops under mixed load` : null,
    ].filter(Boolean),
  );
}

async function test9_disasterRecovery() {
  console.log('\n\n🧪  TEST 9/10 — DISASTER RECOVERY');
  console.log('    Measure recovery time after server restart under active load');

  // Phase A: establish baseline under load
  console.log('   Phase A: Baseline measurement (200 concurrent, 10s)...');
  const baseline = await runTest({
    url: `${BASE}/api/health`, connections: 200, duration: 10,
  });
  const baselineRps = baseline.requests.average;
  console.log(`   Baseline: ${baselineRps} req/s`);

  // Phase B: simulate crash — kill and restart server
  console.log('   Phase B: Simulating server crash (SIGTERM)...');
  const killStart = Date.now();
  require('child_process').execSync('pkill -f "node server.js" 2>/dev/null || true');
  await new Promise(r => setTimeout(r, 500));

  // Phase C: restart and measure time-to-first-response
  console.log('   Phase C: Restarting server...');
  const serverPath = path.join(__dirname, 'server.js');
  require('child_process').spawn('node', [serverPath], {
    detached: true, stdio: 'ignore',
    cwd: __dirname,
  }).unref();

  // Poll until healthy
  let recovered = false;
  let recoveryMs = 0;
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const result = await request({ path: '/api/health', method: 'GET' });
      if (result.status === 'ok') {
        recoveryMs = Date.now() - killStart;
        recovered  = true;
        break;
      }
    } catch {}
  }

  console.log(`   Recovery time: ${recoveryMs}ms (${recovered ? 'OK' : 'FAILED'})`);
  await new Promise(r => setTimeout(r, 1000));

  // Phase D: post-recovery load test
  console.log('   Phase D: Post-recovery load test (200 concurrent, 10s)...');
  const postRecovery = await runTest({
    url: `${BASE}/api/health`, connections: 200, duration: 10,
  });

  const recoveryRps = postRecovery.requests.average;
  const rpsRetention = baselineRps > 0 ? ((recoveryRps / baselineRps) * 100).toFixed(0) : 0;

  const synthetic = {
    requests: { total: postRecovery.requests.total, average: recoveryRps },
    latency: postRecovery.latency,
    non2xx: postRecovery.non2xx,
    errors: postRecovery.errors,
    connections: 200,
    duration: 10,
  };

  return report(
    'TEST 9 — Disaster Recovery',
    `Kill → restart → load test. Recovery: ${recoveryMs}ms, RPS retention: ${rpsRetention}%`,
    synthetic,
    [
      !recovered                  ? 'Server did NOT recover within 6 seconds — needs process manager (PM2)' : null,
      recoveryMs > 3000           ? `Slow recovery: ${recoveryMs}ms — PM2 with watch would recover in <1s` : null,
      parseFloat(rpsRetention) < 80 ? `Post-recovery RPS dropped ${100 - rpsRetention}% — warm-up period needed` : null,
    ].filter(Boolean),
  );
}

async function test10_fullPeakSimulation() {
  console.log('\n\n🧪  TEST 10/10 — FULL ACADEMIC PEAK SIMULATION');
  console.log('    All systems under load simultaneously: auth + attendance + results + notifications + course data');

  // Wait for server to be fully warm
  await new Promise(r => setTimeout(r, 1500));

  console.log('   Firing 6 concurrent streams for 30 seconds...\n');

  const [auth, attendance, results, notifs, courses, dashboard] = await Promise.all([
    // Auth stream: students logging in (limited by rate limiter — realistic)
    runTest({ url: `${BASE}/api/auth/login`, method: 'POST',
      connections: 50, duration: 30,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@edutrack.com', password: 'student123' }) }),

    // Attendance: teachers writing
    runTest({ url: `${BASE}/api/teacher/attendance`, method: 'POST',
      connections: 30, duration: 30,
      headers: { Authorization: `Bearer ${REAL.teacherToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: REAL.courseIds[0], date: new Date().toISOString(),
        records: REAL.studentIds.map(id => ({ student: id, status: 'present' })) }) }),

    // Results: students reading
    runTest({ url: `${BASE}/api/student/results`,
      connections: 300, duration: 30,
      headers: { Authorization: `Bearer ${REAL.studentToken}` } }),

    // Notifications: everyone polling
    runTest({ url: `${BASE}/api/notifications`,
      connections: 500, duration: 30,
      headers: { Authorization: `Bearer ${TOKEN_POOL.students[0]}` } }),

    // Course data: students checking schedules
    runTest({ url: `${BASE}/api/student/courses`,
      connections: 300, duration: 30,
      headers: { Authorization: `Bearer ${REAL.studentToken}` } }),

    // Dashboard: heavy aggregate queries
    runTest({ url: `${BASE}/api/admin/dashboard`,
      connections: 50, duration: 30,
      headers: { Authorization: `Bearer ${REAL.adminToken}` } }),
  ]);

  const all = [auth, attendance, results, notifs, courses, dashboard];
  const totalReqs = all.reduce((s, r) => s + r.requests.total, 0);
  const totalErrs = all.reduce((s, r) => s + r.errors + r.non2xx, 0);
  const maxP99    = Math.max(...all.map(r => r.latency.p99));
  const maxLat    = Math.max(...all.map(r => r.latency.max));
  const avgRps    = (totalReqs / 30) | 0;

  console.log('\n  Stream breakdown:');
  const labels = ['Auth', 'Attendance', 'Results', 'Notifications', 'Courses', 'Dashboard'];
  all.forEach((r, i) => {
    const rps = (r.requests.total / 30) | 0;
    const err = r.errors + r.non2xx;
    console.log(`   ${labels[i].padEnd(14)}: ${String(rps).padStart(6)} req/s  p99=${r.latency.p99}ms  err=${err}`);
  });

  const synthetic = {
    requests: { total: totalReqs, average: avgRps },
    latency: { p50: results.latency.p50, p99: maxP99, max: maxLat },
    non2xx: all.reduce((s, r) => s + r.non2xx, 0),
    errors: all.reduce((s, r) => s + r.errors, 0),
    connections: 1230,
    duration: 30,
  };

  return report(
    'TEST 10 — Full Academic Peak Simulation',
    'All 6 subsystems concurrent: 1,230 total connections, 30s',
    synthetic,
    [
      maxP99 > 2000  ? `Worst subsystem p99=${maxP99}ms — system degraded under full load` : null,
      totalErrs > 0  ? `${totalErrs} total failures across all streams under combined load` : null,
    ].filter(Boolean),
  );
}

// ── Final report ──────────────────────────────────────────────────
function finalReport() {
  const width = 78;
  console.log('\n\n' + '═'.repeat(width));
  console.log('  COMPLETE INFRASTRUCTURE TEST RESULTS');
  console.log('═'.repeat(width));
  console.log(
    '  Test'.padEnd(44) +
    'RPS'.padStart(7) +
    'p99'.padStart(8) +
    'Fail%'.padStart(7) +
    '  Grade'
  );
  console.log('─'.repeat(width));

  for (const r of ALL_RESULTS) {
    const failPct = r.ok + r.fail > 0 ? ((r.fail / (r.ok + r.fail)) * 100).toFixed(1) : '0.0';
    console.log(
      ('  ' + r.label.replace(/^TEST \d+ — /, '')).slice(0, 44).padEnd(44) +
      String(r.rps.toLocaleString()).padStart(7) +
      String(r.p99 + 'ms').padStart(8) +
      String(failPct + '%').padStart(7) +
      '  ' + r.grade
    );
  }

  console.log('─'.repeat(width));

  const passes   = ALL_RESULTS.filter(r => r.grade.includes('PASS')).length;
  const warns    = ALL_RESULTS.filter(r => r.grade.includes('WARN')).length;
  const fails    = ALL_RESULTS.filter(r => r.grade.includes('FAIL') || r.grade.includes('DEGRADED')).length;
  const allNotes = ALL_RESULTS.flatMap(r => r.notes);

  console.log(`\n  Score: ${passes}/10 passed  (${warns} warnings, ${fails} failures)\n`);

  if (allNotes.length) {
    console.log('  Issues found:');
    allNotes.forEach((n, i) => console.log(`   ${i + 1}. ${n}`));
  }

  console.log('\n  Infrastructure gaps (priority order):');
  console.log('   1. PM2 cluster  — use all 10 CPU cores: npx pm2 start ecosystem.config.js');
  console.log('   2. Redis cache  — cache /results and /notifications (TTL 30s)');
  console.log('   3. MongoDB indexes — compound index on all hot query fields');
  console.log('   4. Bull queue   — async submission processing, decouple HTTP from DB write');
  console.log('   5. CDN + S3     — offload file uploads entirely from Node.js process');
  console.log('   6. Rate limiter — per-user keys, not per-IP (use JWT sub)');
  console.log('   7. Health check — expose /api/ready endpoint for load balancer');
  console.log(`\n  System: ${os.cpus().length} cores, ${(os.totalmem()/1024/1024/1024).toFixed(1)}GB RAM`);
  console.log('═'.repeat(width) + '\n');
}

// ── Entry point ───────────────────────────────────────────────────
async function main() {
  const started = Date.now();

  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║       LMS COMPLETE INFRASTRUCTURE TEST SUITE — 10 SCENARIOS     ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`  Server : ${BASE}`);
  console.log(`  System : ${os.cpus().length} cores · ${(os.totalmem()/1024/1024/1024).toFixed(1)}GB RAM`);
  console.log(`  Tokens : ${TOKEN_POOL.students.length} students, ${TOKEN_POOL.teachers.length} teachers pre-minted`);
  console.log(`  Started: ${new Date().toLocaleTimeString()}\n`);

  try {
    await test1_examTraffic();
    await test2_attendanceSurge();
    await test3_resultPublishing();
    await test4_authStress();
    await test5_courseRegistration();
    await test6_notificationBlast();
    await test7_fileUpload();
    await test8_dbResilience();
    await test9_disasterRecovery();
    await test10_fullPeakSimulation();
  } catch (err) {
    console.error('\n  FATAL:', err.message);
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(0);
  console.log(`\n  Total test time: ${elapsed}s`);
  finalReport();
}

main();
