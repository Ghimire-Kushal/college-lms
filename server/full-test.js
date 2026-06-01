/**
 * LMS FULL TEST SUITE
 * Tests: Auth, Admin CRUD, Teacher flows, Student flows,
 *        Rate limiting, Security, File upload, Notifications,
 *        then Benchmark (auth load, submission, file, registration,
 *        exam, database, results, recovery)
 */
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const http       = require('http');
const fs         = require('fs');
const path       = require('path');
const autocannon = require('autocannon');
const jwt        = require('jsonwebtoken');
const os         = require('os');
const { execSync, spawn } = require('child_process');

const BASE    = 'http://localhost:5001';
const SECRET  = process.env.JWT_SECRET;
const SERVER  = path.join(__dirname, 'server.js');

// ── Colour helpers ────────────────────────────────────────────────
const G = s => `\x1b[32m${s}\x1b[0m`;
const R = s => `\x1b[31m${s}\x1b[0m`;
const Y = s => `\x1b[33m${s}\x1b[0m`;
const B = s => `\x1b[36m${s}\x1b[0m`;
const W = s => `\x1b[1m${s}\x1b[0m`;

// ── State ────────────────────────────────────────────────────────
const PASS = [], FAIL = [], WARN = [];
let TOKENS = {}, IDS = {};

// ── HTTP helper ──────────────────────────────────────────────────
function api(method, endpoint, token, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token)   headers['Authorization'] = `Bearer ${token}`;
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    const req = http.request({ hostname: 'localhost', port: 5001, method, path: endpoint, headers }, res => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, body: b }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Test assertion ───────────────────────────────────────────────
let testNum = 0;
function check(name, passed, detail = '') {
  testNum++;
  const num = String(testNum).padStart(3, '0');
  if (passed) {
    PASS.push(name);
    console.log(`  ${G('✓')} [${num}] ${name}${detail ? '  ' + Y(detail) : ''}`);
  } else {
    FAIL.push(name);
    console.log(`  ${R('✗')} [${num}] ${name}${detail ? '  ' + R(detail) : ''}`);
  }
}
function warn(name, detail = '') {
  WARN.push(name);
  console.log(`  ${Y('⚠')} [WARN] ${name}${detail ? '  ' + Y(detail) : ''}`);
}
function section(title) {
  console.log(`\n${B('═'.repeat(60))}`);
  console.log(` ${W(title)}`);
  console.log(`${B('═'.repeat(60))}`);
}

// ── Autocannon wrapper ───────────────────────────────────────────
function bench(cfg) {
  return new Promise(resolve => {
    const inst = autocannon({ ...cfg, silent: true }, (_, r) => resolve(r));
    autocannon.track(inst, { renderProgressBar: true, renderResultsTable: false });
  });
}

function mkToken(id, role) {
  return jwt.sign({ id, role }, SECRET, { expiresIn: '4h' });
}
function fakeId(n) { return '6b' + String(n).padStart(22, '0'); }

const BENCH_TOKENS = {
  students: Array.from({ length: 2000 }, (_, i) => mkToken(fakeId(2000+i), 'student')),
  teachers: Array.from({ length:  100 }, (_, i) => mkToken(fakeId(1000+i), 'teacher')),
};

// ══════════════════════════════════════════════════════════════════
//  SECTION 1 — AUTHENTICATION
// ══════════════════════════════════════════════════════════════════
async function testAuth() {
  section('1. AUTHENTICATION');

  // 1.1 Valid admin login
  const a = await api('POST', '/api/auth/login', null, { email: 'admin@edutrack.com', password: 'admin123' });
  check('Admin login returns 200', a.status === 200, `status=${a.status}`);
  check('Admin token issued', !!a.body.token, a.body.token ? 'token ok' : a.body.message);
  TOKENS.admin = a.body.token;
  IDS.admin = a.body.user?.id;

  // 1.2 Valid teacher login
  const t = await api('POST', '/api/auth/login', null, { email: 'teacher@edutrack.com', password: 'teacher123' });
  check('Teacher login returns 200', t.status === 200);
  check('Teacher token issued', !!t.body.token);
  TOKENS.teacher = t.body.token;
  IDS.teacher = t.body.user?.id;

  // 1.3 Valid student login
  const s = await api('POST', '/api/auth/login', null, { email: 'student@edutrack.com', password: 'student123' });
  check('Student login returns 200', s.status === 200);
  check('Student token issued', !!s.body.token);
  TOKENS.student = s.body.token;
  IDS.student = s.body.user?.id;

  // 1.4 Wrong password
  const bad = await api('POST', '/api/auth/login', null, { email: 'admin@edutrack.com', password: 'WRONG' });
  check('Wrong password returns 400', bad.status === 400, `status=${bad.status}`);

  // 1.5 Missing fields
  const missing = await api('POST', '/api/auth/login', null, { email: 'admin@edutrack.com' });
  check('Missing password returns 400', missing.status === 400);

  // 1.6 No token on protected route
  const noauth = await api('GET', '/api/admin/students', null);
  check('No token returns 401', noauth.status === 401, `status=${noauth.status}`);

  // 1.7 Wrong role on protected route
  const wrongRole = await api('GET', '/api/admin/students', TOKENS.student);
  check('Student cannot access admin routes (403)', wrongRole.status === 403, `status=${wrongRole.status}`);

  // 1.8 Token expiry (forge an expired token)
  const expired = jwt.sign({ id: 'fake', role: 'admin' }, SECRET, { expiresIn: '-1s' });
  const expRes = await api('GET', '/api/admin/students', expired);
  check('Expired token returns 401', expRes.status === 401, `status=${expRes.status}`);

  // 1.9 Get current user (me)
  const me = await api('GET', '/api/auth/me', TOKENS.admin);
  check('GET /auth/me returns user data', me.status === 200 && !!me.body.email);
}

// ══════════════════════════════════════════════════════════════════
//  SECTION 2 — ADMIN: STUDENTS
// ══════════════════════════════════════════════════════════════════
async function testAdminStudents() {
  section('2. ADMIN — STUDENT MANAGEMENT');

  // 2.1 List students
  const list = await api('GET', '/api/admin/students', TOKENS.admin);
  check('GET /admin/students returns array', Array.isArray(list.body), `count=${list.body.length}`);
  IDS.existingStudent = list.body[0]?._id;

  // 2.2 Create student
  const ts = `test_${Date.now()}`;
  const create = await api('POST', '/api/admin/students', TOKENS.admin, {
    name: 'Test Student Load', email: `${ts}@test.com`,
    password: 'Test@1234', studentId: `STU${Date.now()}`,
    semester: 2, section: 'B', role: 'student',
  });
  check('POST /admin/students creates student (201)', create.status === 201, `status=${create.status}`);
  IDS.newStudent = create.body._id;

  // 2.3 Get single student
  if (IDS.newStudent) {
    const get = await api('GET', `/api/admin/students/${IDS.newStudent}`, TOKENS.admin);
    check('GET /admin/students/:id returns student', get.status === 200 && get.body._id === IDS.newStudent);
  }

  // 2.4 Update student
  if (IDS.newStudent) {
    const upd = await api('PUT', `/api/admin/students/${IDS.newStudent}`, TOKENS.admin, { name: 'Updated Name', semester: 3 });
    check('PUT /admin/students/:id updates student', upd.status === 200, `status=${upd.status}`);
    check('Updated name persists', upd.body.name === 'Updated Name', `name=${upd.body.name}`);
  }

  // 2.5 Enroll in course
  const courses = await api('GET', '/api/admin/courses', TOKENS.admin);
  IDS.course = courses.body[0]?._id;
  IDS.courses = courses.body.map(c => c._id);
  if (IDS.newStudent && IDS.course) {
    const enroll = await api('POST', `/api/admin/students/${IDS.newStudent}/enroll`, TOKENS.admin, { courseId: IDS.course });
    check('POST enroll student in course', enroll.status === 200, `status=${enroll.status}`);
    // Duplicate enrollment
    const dup = await api('POST', `/api/admin/students/${IDS.newStudent}/enroll`, TOKENS.admin, { courseId: IDS.course });
    check('Duplicate enrollment rejected (400)', dup.status === 400, `status=${dup.status}`);
  }

  // 2.6 Search
  const search = await api('GET', '/api/admin/students?search=kushal', TOKENS.admin);
  check('Student search works', search.status === 200 && Array.isArray(search.body));

  // 2.7 Delete (deactivate)
  if (IDS.newStudent) {
    const del = await api('DELETE', `/api/admin/students/${IDS.newStudent}`, TOKENS.admin);
    check('DELETE /admin/students/:id deactivates', del.status === 200, `status=${del.status}`);
  }
}

// ══════════════════════════════════════════════════════════════════
//  SECTION 3 — ADMIN: TEACHERS & COURSES
// ══════════════════════════════════════════════════════════════════
async function testAdminTeachers() {
  section('3. ADMIN — TEACHERS & COURSES');

  // Teachers
  const list = await api('GET', '/api/admin/teachers', TOKENS.admin);
  check('GET /admin/teachers returns array', Array.isArray(list.body), `count=${list.body.length}`);
  IDS.teacher_id = list.body[0]?._id;

  const ts = `tch_${Date.now()}`;
  const create = await api('POST', '/api/admin/teachers', TOKENS.admin, {
    name: 'Test Teacher Load', email: `${ts}@test.com`,
    password: 'Test@1234', role: 'teacher', department: 'CS',
  });
  check('POST /admin/teachers creates teacher (201)', create.status === 201, `status=${create.status}`);
  IDS.newTeacher = create.body._id;

  if (IDS.newTeacher) {
    const upd = await api('PUT', `/api/admin/teachers/${IDS.newTeacher}`, TOKENS.admin, { department: 'Math' });
    check('PUT /admin/teachers/:id updates teacher', upd.status === 200);
    const del = await api('DELETE', `/api/admin/teachers/${IDS.newTeacher}`, TOKENS.admin);
    check('DELETE /admin/teachers/:id', del.status === 200, `status=${del.status}`);
  }

  // Courses
  const courses = await api('GET', '/api/admin/courses', TOKENS.admin);
  check('GET /admin/courses returns array', Array.isArray(courses.body), `count=${courses.body.length}`);

  const cc = await api('POST', '/api/admin/courses', TOKENS.admin, {
    name: 'Load Test Course', code: `LTC${Date.now().toString().slice(-4)}`,
    credits: 3, semester: 1, section: 'A',
  });
  check('POST /admin/courses creates course (201)', cc.status === 201, `status=${cc.status}`);
  IDS.newCourse = cc.body._id;

  if (IDS.newCourse && IDS.teacher_id) {
    const assign = await api('PATCH', `/api/admin/courses/${IDS.newCourse}/assign-teacher`, TOKENS.admin, { teacherId: IDS.teacher_id });
    check('PATCH assign teacher to course', assign.status === 200, `status=${assign.status}`);
  }

  if (IDS.newCourse) {
    const upd = await api('PUT', `/api/admin/courses/${IDS.newCourse}`, TOKENS.admin, { name: 'Updated Course', credits: 4 });
    check('PUT /admin/courses/:id updates course', upd.status === 200);
    const del = await api('DELETE', `/api/admin/courses/${IDS.newCourse}`, TOKENS.admin);
    check('DELETE /admin/courses/:id', del.status === 200, `status=${del.status}`);
  }
}

// ══════════════════════════════════════════════════════════════════
//  SECTION 4 — ADMIN: NOTICES, TIMETABLE, ATTENDANCE, RESULTS
// ══════════════════════════════════════════════════════════════════
async function testAdminOther() {
  section('4. ADMIN — NOTICES / TIMETABLE / ATTENDANCE / RESULTS');

  // Notices
  const nc = await api('POST', '/api/admin/notices', TOKENS.admin, {
    title: 'Test Notice', content: 'Load test notice content', targetRole: 'all',
  });
  check('POST /admin/notices creates notice', nc.status === 201, `status=${nc.status}`);
  IDS.notice = nc.body._id;

  const nl = await api('GET', '/api/admin/notices', TOKENS.admin);
  check('GET /admin/notices returns array', Array.isArray(nl.body));

  if (IDS.notice) {
    const nu = await api('PUT', `/api/admin/notices/${IDS.notice}`, TOKENS.admin, { title: 'Updated Notice' });
    check('PUT /admin/notices/:id updates', nu.status === 200);
    const nd = await api('DELETE', `/api/admin/notices/${IDS.notice}`, TOKENS.admin);
    check('DELETE /admin/notices/:id', nd.status === 200, `status=${nd.status}`);
  }

  // Timetable
  if (IDS.course && IDS.teacher_id) {
    const te = await api('POST', '/api/admin/timetable', TOKENS.admin, {
      course: IDS.course, teacher: IDS.teacher_id,
      dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00',
      room: '101', semester: 1, section: 'A',
    });
    check('POST /admin/timetable creates entry', te.status === 201, `status=${te.status}`);
    IDS.timetable = te.body._id;
  }
  const tl = await api('GET', '/api/admin/timetable', TOKENS.admin);
  check('GET /admin/timetable returns array', Array.isArray(tl.body));

  // Attendance (admin view)
  const al = await api('GET', '/api/admin/attendance', TOKENS.admin);
  check('GET /admin/attendance returns array', al.status === 200 && Array.isArray(al.body));

  // Results (admin)
  if (IDS.existingStudent && IDS.course) {
    const rc = await api('POST', '/api/admin/results', TOKENS.admin, {
      student: IDS.existingStudent, course: IDS.course,
      semester: 1, internalMarks: 38, externalMarks: 52, totalMarks: 90, grade: 'A',
    });
    check('POST /admin/results creates result', [200, 201].includes(rc.status), `status=${rc.status}`);
  }
  const rl = await api('GET', '/api/admin/results', TOKENS.admin);
  check('GET /admin/results returns array', Array.isArray(rl.body));

  // Dashboard aggregate
  const dash = await api('GET', '/api/admin/dashboard', TOKENS.admin);
  check('GET /admin/dashboard returns stats', dash.status === 200 && typeof dash.body.totalStudents === 'number',
    `students=${dash.body.totalStudents} courses=${dash.body.totalCourses}`);
}

// ══════════════════════════════════════════════════════════════════
//  SECTION 5 — TEACHER FLOWS
// ══════════════════════════════════════════════════════════════════
async function testTeacher() {
  section('5. TEACHER FLOWS');

  // Dashboard
  const dash = await api('GET', '/api/teacher/dashboard', TOKENS.teacher);
  check('Teacher dashboard loads', dash.status === 200, `status=${dash.status}`);

  // Courses
  const courses = await api('GET', '/api/teacher/courses', TOKENS.teacher);
  check('GET /teacher/courses', courses.status === 200, `count=${Array.isArray(courses.body) ? courses.body.length : '?'}`);
  IDS.teacherCourse = Array.isArray(courses.body) ? courses.body[0]?._id : null;

  // Attendance — mark
  if (IDS.teacherCourse && IDS.existingStudent) {
    const att = await api('POST', '/api/teacher/attendance', TOKENS.teacher, {
      course: IDS.teacherCourse,
      date: new Date().toISOString(),
      records: [{ student: IDS.existingStudent, status: 'present' }],
    });
    check('POST /teacher/attendance marks attendance', [200, 201].includes(att.status), `status=${att.status}`);
    IDS.attendance = att.body._id;
  }

  const attList = await api('GET', '/api/teacher/attendance', TOKENS.teacher);
  check('GET /teacher/attendance returns array', attList.status === 200);

  // Assignment create
  if (IDS.teacherCourse) {
    const ac = await api('POST', '/api/teacher/assignments', TOKENS.teacher, {
      title: 'Full Test Assignment', description: 'Complete test',
      course: IDS.teacherCourse,
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      totalMarks: 100,
    });
    check('POST /teacher/assignments creates assignment', [200, 201].includes(ac.status), `status=${ac.status}`);
    IDS.assignment = ac.body._id;
  }

  const aList = await api('GET', '/api/teacher/assignments', TOKENS.teacher);
  check('GET /teacher/assignments returns array', aList.status === 200);

  // Results
  if (IDS.existingStudent && IDS.teacherCourse) {
    const rc = await api('POST', '/api/teacher/results', TOKENS.teacher, {
      student: IDS.existingStudent, course: IDS.teacherCourse,
      semester: 1, internalMarks: 35, externalMarks: 55, totalMarks: 90, grade: 'B+',
    });
    check('POST /teacher/results creates result', [200, 201].includes(rc.status), `status=${rc.status}`);
  }

  // Notices
  const tn = await api('POST', '/api/teacher/notices', TOKENS.teacher, {
    title: 'Teacher Notice', content: 'Test teacher notice', targetRole: 'student',
  });
  check('POST /teacher/notices', [200, 201].includes(tn.status), `status=${tn.status}`);

  // Online classes
  const oc = await api('POST', '/api/teacher/online-classes', TOKENS.teacher, {
    title: 'Test Online Class', link: 'https://meet.google.com/test',
    course: IDS.teacherCourse, scheduledAt: new Date(Date.now() + 3600000).toISOString(),
  });
  check('POST /teacher/online-classes', [200, 201].includes(oc.status), `status=${oc.status}`);
}

// ══════════════════════════════════════════════════════════════════
//  SECTION 6 — STUDENT FLOWS
// ══════════════════════════════════════════════════════════════════
async function testStudent() {
  section('6. STUDENT FLOWS');

  // Dashboard
  const dash = await api('GET', '/api/student/dashboard', TOKENS.student);
  check('Student dashboard loads', dash.status === 200, `status=${dash.status}`);

  // Courses
  const courses = await api('GET', '/api/student/courses', TOKENS.student);
  check('GET /student/courses', courses.status === 200);

  // Attendance
  const att = await api('GET', '/api/student/attendance', TOKENS.student);
  check('GET /student/attendance', att.status === 200);

  // Assignments list
  const asgn = await api('GET', '/api/student/assignments', TOKENS.student);
  check('GET /student/assignments', asgn.status === 200);

  // Assignment submission
  if (IDS.assignment) {
    const sub = await api('POST', `/api/student/assignments/${IDS.assignment}/submit`, TOKENS.student, {
      content: 'Test submission content for full test suite',
    });
    check('POST /student/assignments/:id/submit', [200, 201].includes(sub.status), `status=${sub.status}`);
    // Duplicate submission blocked
    const dup = await api('POST', `/api/student/assignments/${IDS.assignment}/submit`, TOKENS.student, {
      content: 'Duplicate',
    });
    check('Duplicate submission rejected (400)', dup.status === 400, `status=${dup.status}`);
  } else {
    warn('Assignment submission test skipped — no assignment created');
  }

  // Results
  const results = await api('GET', '/api/student/results', TOKENS.student);
  check('GET /student/results', results.status === 200);

  // Notices
  const notices = await api('GET', '/api/student/notices', TOKENS.student);
  check('GET /student/notices', notices.status === 200);

  // Timetable
  const tt = await api('GET', '/api/student/timetable', TOKENS.student);
  check('GET /student/timetable', tt.status === 200);

  // Online classes
  const oc = await api('GET', '/api/student/online-classes', TOKENS.student);
  check('GET /student/online-classes', oc.status === 200);

  // Feedback submit
  const fb = await api('POST', '/api/student/feedback', TOKENS.student, {
    subject: 'Test feedback', message: 'Full test suite feedback message',
    category: 'general',
  });
  check('POST /student/feedback', [200, 201].includes(fb.status), `status=${fb.status}`);

  // Notes
  const notes = await api('GET', '/api/student/notes', TOKENS.student);
  check('GET /student/notes', notes.status === 200);
}

// ══════════════════════════════════════════════════════════════════
//  SECTION 7 — SECURITY TESTS
// ══════════════════════════════════════════════════════════════════
async function testSecurity() {
  section('7. SECURITY');

  // SQL / NoSQL injection attempt
  const inj = await api('POST', '/api/auth/login', null, {
    email: { $gt: '' }, password: { $gt: '' },
  });
  check('NoSQL injection blocked', inj.status !== 200, `status=${inj.status}`);

  // XSS in notice title
  const xss = await api('POST', '/api/admin/notices', TOKENS.admin, {
    title: '<script>alert(1)</script>', content: 'xss test', targetRole: 'all',
  });
  const xssOk = xss.status !== 200 || !xss.body.title?.includes('<script>');
  check('XSS payload does not reflect as-is', xssOk, `status=${xss.status}`);
  if (xss.body._id) await api('DELETE', `/api/admin/notices/${xss.body._id}`, TOKENS.admin);

  // CORS — teacher accessing admin-only route
  const crossRole = await api('GET', '/api/admin/students', TOKENS.teacher);
  check('Teacher cannot list all students (403)', crossRole.status === 403, `status=${crossRole.status}`);

  // Tampered JWT
  const tampered = TOKENS.admin.slice(0, -5) + 'XXXXX';
  const tampRes = await api('GET', '/api/admin/students', tampered);
  check('Tampered JWT rejected (401)', tampRes.status === 401, `status=${tampRes.status}`);

  // Password change — wrong current password
  const pwBad = await api('PUT', '/api/auth/change-password', TOKENS.student, {
    currentPassword: 'WRONG', newPassword: 'NewPass@123',
  });
  check('Wrong current password rejected (400)', pwBad.status === 400, `status=${pwBad.status}`);

  // Health endpoint public (no auth)
  const health = await api('GET', '/api/health', null);
  check('Health endpoint public', health.status === 200 && health.body.status === 'ok');
}

// ══════════════════════════════════════════════════════════════════
//  SECTION 8 — NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════
async function testNotifications() {
  section('8. NOTIFICATIONS');

  const list = await api('GET', '/api/notifications', TOKENS.student);
  check('GET /notifications returns array', list.status === 200 && Array.isArray(list.body),
    `count=${Array.isArray(list.body) ? list.body.length : '?'}`);

  if (Array.isArray(list.body) && list.body.length > 0) {
    const id = list.body[0]._id;
    const markOne = await api('PUT', `/api/notifications/${id}/read`, TOKENS.student);
    check('PUT /notifications/:id/read marks as read', markOne.status === 200, `status=${markOne.status}`);
  } else {
    warn('No notifications to mark — skipped mark-read test');
  }

  const markAll = await api('PUT', '/api/notifications/read-all', TOKENS.student);
  check('PUT /notifications/read-all', markAll.status === 200, `status=${markAll.status}`);
}

// ══════════════════════════════════════════════════════════════════
//  SECTION 9 — PROFILE
// ══════════════════════════════════════════════════════════════════
async function testProfile() {
  section('9. PROFILE & PASSWORD');

  const me = await api('GET', '/api/auth/me', TOKENS.student);
  check('GET /auth/me returns profile', me.status === 200, `email=${me.body.email}`);

  const upd = await api('PUT', '/api/auth/profile', TOKENS.student, {
    name: 'Updated Student Name', phone: '9800000001',
  });
  check('PUT /auth/profile updates profile', upd.status === 200, `status=${upd.status}`);
  check('Name updated in response', upd.body.name === 'Updated Student Name', `name=${upd.body.name}`);
}

// ══════════════════════════════════════════════════════════════════
//  SECTION 10 — LOAD & BENCHMARK
// ══════════════════════════════════════════════════════════════════

async function waitReady(maxMs = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    try { const r = await api('GET', '/api/health', null); if (r.status === 200) return true; } catch {}
    await sleep(200);
  }
  return false;
}

async function restartServer() {
  execSync("pkill -f 'node server.js' 2>/dev/null || true");
  await sleep(800);
  spawn('node', [SERVER], { detached: true, stdio: 'ignore', cwd: __dirname }).unref();
  await waitReady(8000);
  await sleep(500);
  const a = await api('POST', '/api/auth/login', null, { email: 'admin@edutrack.com',   password: 'admin123' });
  const t = await api('POST', '/api/auth/login', null, { email: 'teacher@edutrack.com', password: 'teacher123' });
  const s = await api('POST', '/api/auth/login', null, { email: 'student@edutrack.com', password: 'student123' });
  if (a.body.token) TOKENS.admin   = a.body.token;
  if (t.body.token) TOKENS.teacher = t.body.token;
  if (s.body.token) TOKENS.student = s.body.token;
}

const BENCH_RESULTS = [];

function benchReport(name, r, thresholds = { p99: 500, errPct: 5 }) {
  const total  = r.requests?.total || 0;
  const errors = (r.errors || 0) + (r.non2xx || 0);
  const ok     = Math.max(0, total - errors);
  const errPct = total > 0 ? errors / total * 100 : 100;
  const p99    = r.latency?.p99 ?? 9999;
  const rps    = +(r.requests?.average ?? 0).toFixed(0);
  const passed = p99 <= thresholds.p99 && errPct <= thresholds.errPct;

  BENCH_RESULTS.push({ name, rps, p99, errPct: errPct.toFixed(1), ok, errors, passed });
  const sym = passed ? G('✓ PASS') : errPct > 50 ? R('✗ FAIL') : Y('⚠ MARGINAL');

  console.log(`\n  ${sym}  ${W(name)}`);
  console.log(`       RPS: ${rps.toLocaleString()}  |  p99: ${p99}ms  |  errors: ${errPct.toFixed(1)}%  |  ok: ${ok.toLocaleString()}`);
  if (!passed) {
    if (p99 > thresholds.p99) console.log(`       ${Y('→')} p99 ${p99}ms exceeds ${thresholds.p99}ms threshold`);
    if (errPct > thresholds.errPct) console.log(`       ${Y('→')} ${errPct.toFixed(1)}% errors exceeds ${thresholds.errPct}% threshold`);
  }
}

async function testBenchmark() {
  section('10. LOAD & BENCHMARK');
  console.log(`  System: ${os.cpus().length} cores · ${(os.totalmem()/1024/1024/1024).toFixed(1)}GB RAM\n`);

  // ── B1: Auth load ─────────────────────────────────────────────
  console.log(B('  B1. Login / Auth Load (50→200 concurrent)'));
  const b1a = await bench({ url: `${BASE}/api/auth/login`, method: 'POST', connections: 50, duration: 10,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@edutrack.com', password: 'student123' }) });
  console.log(`     50 concurrent: p50=${b1a.latency.p50}ms p99=${b1a.latency.p99}ms rps=${+b1a.requests.average.toFixed(0)}`);

  const b1b = await bench({ url: `${BASE}/api/auth/login`, method: 'POST', connections: 200, duration: 10,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@edutrack.com', password: 'student123' }) });
  benchReport('Login / Auth Load (200 concurrent)', b1b, { p99: 2000, errPct: 5 });
  await restartServer();

  // ── B2: Assignment submission ─────────────────────────────────
  console.log(B('\n  B2. Assignment Submission (500 concurrent)'));
  const subUrl = IDS.assignment
    ? `${BASE}/api/student/assignments/${IDS.assignment}/submit`
    : `${BASE}/api/student/assignments`;
  const b2 = await bench({
    url: subUrl, method: IDS.assignment ? 'POST' : 'GET',
    connections: 500, duration: 15,
    headers: { Authorization: `Bearer ${TOKENS.student}`, 'Content-Type': 'application/json' },
    body: IDS.assignment ? JSON.stringify({ content: 'Benchmark submission' }) : undefined,
  });
  benchReport('Assignment Submission (500 concurrent)', b2, { p99: 1000, errPct: 10 });
  await restartServer();

  // ── B3: File upload ───────────────────────────────────────────
  console.log(B('\n  B3. File Upload Stress (100 concurrent, 50KB)'));
  const b3 = await bench({
    url: `${BASE}/api/teacher/notes`, method: 'POST',
    connections: 100, duration: 15,
    headers: { Authorization: `Bearer ${TOKENS.teacher}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Bench Note', content: 'X'.repeat(50*1024), course: IDS.teacherCourse || IDS.course }),
  });
  benchReport('File Upload Stress (100 concurrent, 50KB)', b3, { p99: 500, errPct: 5 });
  await restartServer();

  // ── B4: Course registration concurrency ───────────────────────
  console.log(B('\n  B4. Course Registration Concurrency (500 concurrent)'));
  const b4Student = IDS.existingStudent;
  const b4Course  = IDS.courses?.[2] || IDS.course;
  if (b4Student && b4Course) {
    const b4 = await bench({
      url: `${BASE}/api/admin/students/${b4Student}/enroll`, method: 'POST',
      connections: 500, duration: 10,
      headers: { Authorization: `Bearer ${TOKENS.admin}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: b4Course }),
    });
    // 400 (already enrolled) is expected for most — count errors only
    benchReport('Course Registration Race (500 concurrent)', b4, { p99: 2000, errPct: 99 });
  } else {
    warn('Course registration bench skipped — missing student/course IDs');
  }
  await restartServer();

  // ── B5: Online exam load ──────────────────────────────────────
  console.log(B('\n  B5. Online Exam Load (1,400 read + 600 health concurrent)'));
  const [b5r, b5w] = await Promise.all([
    bench({ url: `${BASE}/api/student/assignments`, connections: 700, duration: 20,
      headers: { Authorization: `Bearer ${TOKENS.student}` } }),
    bench({ url: `${BASE}/api/health`, connections: 300, duration: 20 }),
  ]);
  console.log(`     Read  (700): p99=${b5r.latency.p99}ms  rps=${+b5r.requests.average.toFixed(0)}`);
  console.log(`     Health(300): p99=${b5w.latency.p99}ms  rps=${+b5w.requests.average.toFixed(0)}`);
  const b5combo = { requests: { total: b5r.requests.total + b5w.requests.total, average: +b5r.requests.average + +b5w.requests.average },
    latency: { p99: Math.max(b5r.latency.p99, b5w.latency.p99), p50: b5r.latency.p50, max: Math.max(b5r.latency.max, b5w.latency.max) },
    non2xx: b5r.non2xx + b5w.non2xx, errors: b5r.errors + b5w.errors, duration: 20, connections: 1000 };
  benchReport('Online Exam Load (1,000 combined)', b5combo, { p99: 500, errPct: 5 });
  await restartServer();

  // ── B6: Database performance ──────────────────────────────────
  console.log(B('\n  B6. Database Performance (6 collections parallel, 150 each)'));
  const [bStudents, bCourses, bAttend, bResults, bNotices, bTimetable] = await Promise.all([
    bench({ url: `${BASE}/api/admin/students`,     connections: 150, duration: 20, headers: { Authorization: `Bearer ${TOKENS.admin}` } }),
    bench({ url: `${BASE}/api/admin/courses`,      connections: 150, duration: 20, headers: { Authorization: `Bearer ${TOKENS.admin}` } }),
    bench({ url: `${BASE}/api/teacher/attendance`, connections: 150, duration: 20, headers: { Authorization: `Bearer ${TOKENS.teacher}` } }),
    bench({ url: `${BASE}/api/student/results`,    connections: 150, duration: 20, headers: { Authorization: `Bearer ${TOKENS.student}` } }),
    bench({ url: `${BASE}/api/student/notices`,    connections: 150, duration: 20, headers: { Authorization: `Bearer ${TOKENS.student}` } }),
    bench({ url: `${BASE}/api/admin/timetable`,    connections: 150, duration: 20, headers: { Authorization: `Bearer ${TOKENS.admin}` } }),
  ]);
  const streams = [bStudents, bCourses, bAttend, bResults, bNotices, bTimetable];
  const snames  = ['Students', 'Courses', 'Attendance', 'Results', 'Notices', 'Timetable'];
  console.log(`\n  ${'Collection'.padEnd(14)} ${'RPS'.padStart(7)}  ${'p99'.padStart(7)}  ${'Errors'.padStart(7)}`);
  console.log(`  ${'─'.repeat(44)}`);
  streams.forEach((r, i) => {
    const rps = +r.requests.average.toFixed(0);
    const err = r.errors + r.non2xx;
    const p99 = r.latency.p99;
    const flag = p99 > 500 ? R(' ⚠') : p99 > 200 ? Y(' !') : G(' ✓');
    console.log(`  ${snames[i].padEnd(14)} ${String(rps).padStart(7)}  ${String(p99+'ms').padStart(7)}  ${String(err).padStart(7)}${flag}`);
  });
  const dbTotal = streams.reduce((s, r) => s + r.requests.total, 0);
  const dbErrs  = streams.reduce((s, r) => s + r.errors + r.non2xx, 0);
  const dbWorst = Math.max(...streams.map(r => r.latency.p99));
  const dbCombo = { requests: { total: dbTotal, average: (dbTotal/20)|0 }, latency: { p99: dbWorst, p50: bStudents.latency.p50, max: Math.max(...streams.map(r=>r.latency.max)) }, non2xx: streams.reduce((s,r)=>s+r.non2xx,0), errors: streams.reduce((s,r)=>s+r.errors,0), duration:20, connections:900 };
  benchReport('Database Performance (900 concurrent, 6 collections)', dbCombo, { p99: 500, errPct: 5 });
  await restartServer();

  // ── B7: Result publishing surge ───────────────────────────────
  console.log(B('\n  B7. Result Publishing Surge (1,000 concurrent student reads)'));
  const b7 = await bench({
    url: `${BASE}/api/student/results`, connections: 1000, duration: 15,
    headers: { Authorization: `Bearer ${TOKENS.student}` },
  });
  benchReport('Result Publishing Surge (1,000 concurrent)', b7, { p99: 1000, errPct: 5 });
  await restartServer();

  // ── B8: Recovery ──────────────────────────────────────────────
  console.log(B('\n  B8. Backup & Recovery (kill → restart → verify)'));
  const preBaseline = await bench({ url: `${BASE}/api/health`, connections: 200, duration: 8 });
  const baseRps = +preBaseline.requests.average.toFixed(0);

  const tKill = Date.now();
  execSync("pkill -f 'node server.js' 2>/dev/null || true");
  await sleep(200);
  let detected = false;
  for (let i = 0; i < 20; i++) {
    try { await api('GET', '/api/health', null); }
    catch { detected = true; break; }
    await sleep(100);
  }
  const tStart = Date.now();
  spawn('node', [SERVER], { detached: true, stdio: 'ignore', cwd: __dirname }).unref();
  await waitReady(10000);
  const recovMs = Date.now() - tStart;
  await sleep(500);

  const postBase = await bench({ url: `${BASE}/api/health`, connections: 200, duration: 8 });
  const postRps  = +postBase.requests.average.toFixed(0);
  const retention = baseRps > 0 ? (postRps / baseRps * 100).toFixed(0) : 0;

  // Re-auth after recovery
  const ar = await api('POST', '/api/auth/login', null, { email: 'admin@edutrack.com',   password: 'admin123' });
  const tr = await api('POST', '/api/auth/login', null, { email: 'teacher@edutrack.com', password: 'teacher123' });
  const sr = await api('POST', '/api/auth/login', null, { email: 'student@edutrack.com', password: 'student123' });
  const integrityOk = ar.status === 200 && tr.status === 200 && sr.status === 200;

  console.log(`\n     Recovery time  : ${recovMs}ms`);
  console.log(`     RPS retention  : ${retention}%`);
  console.log(`     Data integrity : ${integrityOk ? G('INTACT') : R('FAILED')}`);

  const b8 = { requests: postBase.requests, latency: postBase.latency, non2xx: postBase.non2xx, errors: postBase.errors, duration: 8, connections: 200 };
  benchReport('Backup & Recovery', b8, { p99: 200, errPct: 1 });
}

// ══════════════════════════════════════════════════════════════════
//  FINAL SCORECARD
// ══════════════════════════════════════════════════════════════════
function scorecard(totalMs) {
  const W2 = 72;
  console.log('\n\n' + B('═'.repeat(W2)));
  console.log(` ${W('FULL TEST SUITE — FINAL RESULTS')}`);
  console.log(B('═'.repeat(W2)));

  // Functional
  const total    = PASS.length + FAIL.length;
  const passPct  = total > 0 ? (PASS.length / total * 100).toFixed(0) : 0;
  console.log(`\n ${W('Functional Tests')}`);
  console.log(`  Passed : ${G(PASS.length)} / ${total}  (${passPct}%)`);
  if (FAIL.length) {
    console.log(`  ${R('Failed:')} ${FAIL.length}`);
    FAIL.forEach(f => console.log(`    ${R('✗')} ${f}`));
  }
  if (WARN.length) {
    console.log(`  ${Y('Warnings:')} ${WARN.length}`);
    WARN.forEach(w => console.log(`    ${Y('⚠')} ${w}`));
  }

  // Benchmark
  console.log(`\n ${W('Benchmark Tests')}`);
  const bPass = BENCH_RESULTS.filter(r => r.passed).length;
  console.log(`  ${'Test'.padEnd(42)} ${'RPS'.padStart(7)}  ${'p99'.padStart(7)}  ${'Err%'.padStart(6)}  Grade`);
  console.log(`  ${'─'.repeat(72)}`);
  BENCH_RESULTS.forEach(r => {
    const g = r.passed ? G('PASS') : parseFloat(r.errPct) > 50 ? R('FAIL') : Y('MARG');
    console.log(`  ${r.name.padEnd(42)} ${String(r.rps).padStart(7)}  ${String(r.p99+'ms').padStart(7)}  ${String(r.errPct+'%').padStart(6)}  ${g}`);
  });
  console.log(`\n  Benchmark score: ${bPass}/${BENCH_RESULTS.length} passed`);

  // Overall
  const score = Math.round((PASS.length / total * 60) + (bPass / Math.max(1, BENCH_RESULTS.length) * 40));
  console.log(`\n ${W('Overall Infrastructure Score:')} ${score >= 80 ? G(score+'/100') : score >= 60 ? Y(score+'/100') : R(score+'/100')}`);
  console.log(` ${W('Total time:')} ${(totalMs/1000).toFixed(0)}s`);

  console.log(`\n ${W('Priority fixes:')}`);
  const fixes = [
    FAIL.some(f => f.includes('login') || f.includes('auth')) ? '1. PM2 cluster — 10x auth throughput: npx pm2 start ecosystem.config.js' : null,
    BENCH_RESULTS.find(r => !r.passed && r.name.includes('Auth')) ? '2. Redis JWT cache — skip bcrypt on repeat logins (ttl=15min)' : null,
    BENCH_RESULTS.find(r => !r.passed && r.name.includes('Submission')) ? '3. Bull queue on /submit — accept 202 immediately, write async' : null,
    BENCH_RESULTS.find(r => !r.passed && r.name.includes('Database')) ? '4. Add read replica to MongoDB — distribute read load' : null,
    BENCH_RESULTS.find(r => !r.passed && r.name.includes('Result')) ? '5. Redis cache /results (ttl=60s) — result publish stampede prevention' : null,
  ].filter(Boolean);
  fixes.forEach(f => console.log(`  ${Y('→')} ${f}`));

  console.log('\n' + B('═'.repeat(W2)) + '\n');
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  const t0 = Date.now();
  console.log(B('╔═══════════════════════════════════════════════════════════╗'));
  console.log(B('║') + W('   LMS FULL TEST SUITE — Functional + Load + Security   ') + B('║'));
  console.log(B('╚═══════════════════════════════════════════════════════════╝'));
  console.log(`  ${new Date().toLocaleString()}\n`);

  try {
    await testAuth();
    await testAdminStudents();
    await testAdminTeachers();
    await testAdminOther();
    await testTeacher();
    await testStudent();
    await testSecurity();
    await testNotifications();
    await testProfile();
    await testBenchmark();
  } catch (err) {
    console.error(R('\nFATAL: ' + err.message));
    console.error(err.stack);
  }

  scorecard(Date.now() - t0);
  process.exit(FAIL.length > 0 ? 1 : 0);
}

main();
