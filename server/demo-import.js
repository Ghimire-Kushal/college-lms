/**
 * Demo Import — 50 teachers + 500 students across 6 faculties
 * Preserves existing admin + demo accounts (teacher@, student@, etc.)
 * Run: node demo-import.js
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const User     = require('./models/User');
const Course   = require('./models/Course');

dotenv.config();

// ── Name pools (Nepali / South Asian) ────────────────────────────────────────
const FIRST_MALE   = ['Aarav','Bikash','Dipesh','Ganesh','Hari','Ishaan','Jay','Kamal','Lokesh','Manoj',
                      'Narayan','Om','Prajwal','Rajesh','Sanjay','Tejash','Uday','Vikram','Yubraj','Anish',
                      'Bishnu','Chetan','Dinesh','Gopal','Hemraj','Ishan','Kiran','Lalit','Mohan','Niraj',
                      'Paras','Rajan','Sunil','Tilak','Umesh','Vivek','Yogesh','Anil','Binod','Diwas'];
const FIRST_FEMALE = ['Aakriti','Bina','Deepa','Gita','Heena','Isha','Jyoti','Kamala','Laxmi','Manisha',
                      'Nisha','Poonam','Radha','Sita','Tara','Uma','Vandana','Yashoda','Anita','Bishakha',
                      'Chandani','Dipa','Geeta','Hira','Indu','Kabita','Lalita','Mina','Namrata','Priya',
                      'Rita','Sunita','Tulasa','Usha','Vidya','Apsara','Barsha','Chinju','Durga','Elina'];
const LAST        = ['Thapa','Sharma','Gurung','Tamang','Rai','Limbu','Shrestha','Karki','Magar','Poudel',
                     'Bhandari','Adhikari','Subedi','Chaudhary','Shah','KC','Acharya','Koirala','Ghimire',
                     'Regmi','Dahal','Devkota','Joshi','Niroula','Basnet','Bhattarai','Pandey','Timilsina'];

// ── Faculties with their departments ─────────────────────────────────────────
const FACULTIES = [
  {
    name: 'Science & Technology',
    short: 'SCI',
    departments: ['Physics','Chemistry','Mathematics','Computer Science','Biology'],
    courses: [
      { name:'Physics I',             code:'SCI-PHY-101', credits:4, sem:1 },
      { name:'Chemistry I',           code:'SCI-CHM-101', credits:4, sem:1 },
      { name:'Mathematics I',         code:'SCI-MTH-101', credits:4, sem:1 },
      { name:'Computer Fundamentals', code:'SCI-CSC-101', credits:3, sem:1 },
      { name:'Physics II',            code:'SCI-PHY-201', credits:4, sem:2 },
      { name:'Chemistry II',          code:'SCI-CHM-201', credits:4, sem:2 },
      { name:'Mathematics II',        code:'SCI-MTH-201', credits:4, sem:2 },
      { name:'Data Structures',       code:'SCI-CSC-201', credits:3, sem:2 },
      { name:'Organic Chemistry',     code:'SCI-CHM-301', credits:3, sem:3 },
      { name:'Calculus',              code:'SCI-MTH-301', credits:3, sem:3 },
    ],
  },
  {
    name: 'Business & Management',
    short: 'BUS',
    departments: ['Accounting','Finance','Marketing','Human Resources','Economics'],
    courses: [
      { name:'Principles of Management',  code:'BUS-MGT-101', credits:3, sem:1 },
      { name:'Business Mathematics',      code:'BUS-MTH-101', credits:3, sem:1 },
      { name:'Financial Accounting',      code:'BUS-ACC-101', credits:4, sem:1 },
      { name:'Business Communication',    code:'BUS-COM-101', credits:3, sem:1 },
      { name:'Microeconomics',            code:'BUS-ECO-101', credits:3, sem:1 },
      { name:'Marketing Management',      code:'BUS-MKT-201', credits:3, sem:2 },
      { name:'Corporate Finance',         code:'BUS-FIN-201', credits:4, sem:2 },
      { name:'Human Resource Management', code:'BUS-HRM-201', credits:3, sem:2 },
      { name:'Macroeconomics',            code:'BUS-ECO-201', credits:3, sem:2 },
      { name:'Business Law',              code:'BUS-LAW-301', credits:3, sem:3 },
    ],
  },
  {
    name: 'Humanities & Social Sciences',
    short: 'HUM',
    departments: ['English','Nepali','Sociology','Political Science','History'],
    courses: [
      { name:'English Literature I',    code:'HUM-ENG-101', credits:3, sem:1 },
      { name:'Nepali Literature',       code:'HUM-NEP-101', credits:3, sem:1 },
      { name:'Introduction to Sociology', code:'HUM-SOC-101', credits:3, sem:1 },
      { name:'Political Science I',     code:'HUM-POL-101', credits:3, sem:1 },
      { name:'History of Nepal',        code:'HUM-HIS-101', credits:3, sem:1 },
      { name:'English Literature II',   code:'HUM-ENG-201', credits:3, sem:2 },
      { name:'Research Methods',        code:'HUM-SOC-201', credits:3, sem:2 },
      { name:'Comparative Politics',    code:'HUM-POL-201', credits:3, sem:2 },
      { name:'World History',           code:'HUM-HIS-201', credits:3, sem:2 },
      { name:'Media & Society',         code:'HUM-SOC-301', credits:3, sem:3 },
    ],
  },
  {
    name: 'Information Technology',
    short: 'IT',
    departments: ['Software Engineering','Networking','Cybersecurity','AI & ML','Database'],
    courses: [
      { name:'Programming in C',        code:'IT-PRG-101', credits:4, sem:1 },
      { name:'Digital Logic',           code:'IT-DLG-101', credits:3, sem:1 },
      { name:'Computer Networks I',     code:'IT-NET-101', credits:3, sem:1 },
      { name:'Web Development',         code:'IT-WEB-101', credits:3, sem:1 },
      { name:'Object-Oriented Programming', code:'IT-OOP-201', credits:4, sem:2 },
      { name:'Database Management',     code:'IT-DBS-201', credits:3, sem:2 },
      { name:'Computer Networks II',    code:'IT-NET-201', credits:3, sem:2 },
      { name:'Operating Systems',       code:'IT-OSY-201', credits:3, sem:2 },
      { name:'Software Engineering',    code:'IT-SWE-301', credits:3, sem:3 },
      { name:'Cybersecurity Fundamentals', code:'IT-SEC-301', credits:3, sem:3 },
    ],
  },
  {
    name: 'Health Sciences',
    short: 'HLT',
    departments: ['Nursing','Public Health','Medical Lab','Pharmacy','Radiology'],
    courses: [
      { name:'Anatomy & Physiology I',  code:'HLT-ANP-101', credits:4, sem:1 },
      { name:'Microbiology',            code:'HLT-MIC-101', credits:3, sem:1 },
      { name:'Biochemistry',            code:'HLT-BCH-101', credits:3, sem:1 },
      { name:'Health Communication',    code:'HLT-COM-101', credits:3, sem:1 },
      { name:'Anatomy & Physiology II', code:'HLT-ANP-201', credits:4, sem:2 },
      { name:'Pharmacology I',          code:'HLT-PHM-201', credits:3, sem:2 },
      { name:'Medical Lab Techniques',  code:'HLT-LAB-201', credits:3, sem:2 },
      { name:'Epidemiology',            code:'HLT-EPI-201', credits:3, sem:2 },
      { name:'Clinical Practice I',     code:'HLT-CLN-301', credits:4, sem:3 },
      { name:'Pharmacology II',         code:'HLT-PHM-301', credits:3, sem:3 },
    ],
  },
  {
    name: 'Hotel Management',
    short: 'HTL',
    departments: ['Food & Beverage','Front Office','Housekeeping','Event Management','Tourism'],
    courses: [
      { name:'Food & Beverage Service', code:'HTL-FBS-101', credits:3, sem:1 },
      { name:'Front Office Operations', code:'HTL-FOO-101', credits:3, sem:1 },
      { name:'Housekeeping Management', code:'HTL-HKP-101', credits:3, sem:1 },
      { name:'Tourism & Hospitality',   code:'HTL-TOU-101', credits:3, sem:1 },
      { name:'Food Production I',       code:'HTL-FPR-101', credits:4, sem:1 },
      { name:'Food Production II',      code:'HTL-FPR-201', credits:4, sem:2 },
      { name:'Event Management',        code:'HTL-EVT-201', credits:3, sem:2 },
      { name:'Hotel Accounting',        code:'HTL-ACC-201', credits:3, sem:2 },
      { name:'Revenue Management',      code:'HTL-REV-301', credits:3, sem:3 },
      { name:'Hospitality Law',         code:'HTL-LAW-301', credits:3, sem:3 },
    ],
  },
];

const SECTIONS  = ['A','B','C'];
const SEMESTERS = [1,2,3,4,5,6,7,8];
const NP_CITIES = ['Kathmandu','Pokhara','Lalitpur','Bhaktapur','Biratnagar','Butwal','Hetauda',
                   'Dharan','Nepalgunj','Itahari','Birgunj','Janakpur','Gorkha','Dang','Chitwan'];

// ── Helpers ───────────────────────────────────────────────────────────────────
let _nameIdx = 0;
function nextName(gender) {
  const pool = gender === 'M' ? FIRST_MALE : FIRST_FEMALE;
  const first = pool[_nameIdx % pool.length];
  const last  = LAST[Math.floor(_nameIdx / pool.length) % LAST.length];
  _nameIdx++;
  return `${first} ${last}`;
}

function slug(name) {
  return name.toLowerCase().replace(/[^a-z]/g, '').replace(/\s+/g,'.');
}

function phone(i) {
  // Nepali mobile: 98xxxxxxxx or 97xxxxxxxx
  const prefix = i % 2 === 0 ? '98' : '97';
  return `${prefix}${String(10000000 + i).slice(0, 8)}`;
}

function address(i) {
  const city = NP_CITIES[i % NP_CITIES.length];
  const ward = (i % 32) + 1;
  return `Ward ${ward}, ${city}, Nepal`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // ── Remove only demo-generated users (preserve real accounts) ────────────
  const preserved = ['admin@edutrack.com','teacher@edutrack.com','sita@edutrack.com',
                     'student@edutrack.com','priya@edutrack.com','bikash@edutrack.com'];
  await User.deleteMany({ email: { $nin: preserved }, role: { $in: ['teacher','student'] } });
  // Remove only demo-generated courses (keep manually created ones that have IDs we don't know)
  await Course.deleteMany({ code: { $regex: /^(SCI|BUS|HUM|IT|HLT|HTL)-/ } });
  console.log('🗑  Cleared previous demo data (preserved core accounts)\n');

  const teacherDocs = [];
  const courseDocs  = [];

  // ── 50 Teachers — spread across faculties ─────────────────────────────────
  console.log('👨‍🏫 Creating 50 teachers...');
  let tIdx = 0;
  for (const faculty of FACULTIES) {
    const count = Math.round(50 / FACULTIES.length); // ~8-9 per faculty
    for (let d = 0; d < count; d++) {
      const gender = tIdx % 3 === 0 ? 'F' : 'M';
      const name   = nextName(gender);
      const n      = tIdx + 1;
      const emailBase = slug(name);
      const tid    = `TCH${String(100 + n).padStart(4,'0')}`;
      const dept   = faculty.departments[d % faculty.departments.length];
      teacherDocs.push({
        name,
        email: `${emailBase}.${faculty.short.toLowerCase()}@apollocollege.edu.np`,
        password: 'teacher123',
        role: 'teacher',
        teacherId: tid,
        phone: phone(9000 + n),
        address: address(n),
        isActive: true,
        _dept: dept,
        _faculty: faculty,
      });
      tIdx++;
    }
  }

  // Bulk insert teachers (password hashed via pre-save — insert one by one in batches)
  const savedTeachers = [];
  for (const t of teacherDocs) {
    const { _dept, _faculty, ...data } = t;
    const doc = await User.create(data);
    doc._dept    = _dept;
    doc._faculty = _faculty;
    savedTeachers.push(doc);
  }
  console.log(`   → ${savedTeachers.length} teachers created`);

  // ── Courses — assign teachers ──────────────────────────────────────────────
  console.log('📚 Creating courses...');
  for (const faculty of FACULTIES) {
    const facultyTeachers = savedTeachers.filter(t => t._faculty.short === faculty.short);
    for (let ci = 0; ci < faculty.courses.length; ci++) {
      const c   = faculty.courses[ci];
      const teacher = facultyTeachers[ci % facultyTeachers.length];
      for (const sec of SECTIONS) {
        const code = `${c.code}-${sec}`;
        courseDocs.push({
          name: c.name,
          code,
          description: `${c.name} — ${faculty.name} faculty, Section ${sec}`,
          credits: c.credits,
          semester: c.sem,
          section: sec,
          teacher: teacher._id,
          students: [],
          isActive: true,
          _facultyShort: faculty.short,
          _sem: c.sem,
          _sec: sec,
        });
      }
    }
  }

  const savedCourses = [];
  for (const c of courseDocs) {
    const { _facultyShort, _sem, _sec, ...data } = c;
    const doc = await Course.create(data);
    doc._facultyShort = _facultyShort;
    doc._sem  = _sem;
    doc._sec  = _sec;
    savedCourses.push(doc);
  }
  console.log(`   → ${savedCourses.length} courses created (${FACULTIES.length} faculties × 10 courses × 3 sections)`);

  // ── 500 Students ───────────────────────────────────────────────────────────
  console.log('🎓 Creating 500 students...');

  // Distribute: ~83 students per faculty, spread across semesters 1–8, sections A/B/C
  const studentsPerFaculty = Math.ceil(500 / FACULTIES.length); // 84
  let sIdx = 0;
  const savedStudents = [];

  for (const faculty of FACULTIES) {
    const count = sIdx + studentsPerFaculty > 500 ? 500 - sIdx : studentsPerFaculty;
    for (let i = 0; i < count; i++) {
      const gender  = (sIdx + i) % 2 === 0 ? 'F' : 'M';
      const name    = nextName(gender);
      const n       = sIdx + i + 1;
      const sem     = SEMESTERS[(sIdx + i) % SEMESTERS.length];
      const sec     = SECTIONS[(sIdx + i) % SECTIONS.length];
      const sid     = `STU${String(1000 + n).padStart(5,'0')}`;
      const emailBase = slug(name);

      const doc = await User.create({
        name,
        email: `${emailBase}.${String(n).padStart(4,'0')}@student.apollocollege.edu.np`,
        password: 'student123',
        role: 'student',
        studentId: sid,
        semester: sem,
        section: sec,
        phone: phone(n),
        address: address(n),
        isActive: true,
      });

      // Enroll in matching courses (same faculty, same semester, same section)
      const myCourseDocs = savedCourses.filter(
        c => c._facultyShort === faculty.short && c._sem === sem && c._sec === sec
      );
      if (myCourseDocs.length > 0) {
        const courseIds = myCourseDocs.map(c => c._id);
        await User.findByIdAndUpdate(doc._id, { enrolledCourses: courseIds });
        await Course.updateMany({ _id: { $in: courseIds } }, { $addToSet: { students: doc._id } });
      }

      savedStudents.push(doc);
    }
    sIdx += count;
    process.stdout.write(`   → Faculty "${faculty.name}": ${count} students\n`);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const totalTeachers = await User.countDocuments({ role: 'teacher' });
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalCourses  = await Course.countDocuments({});

  console.log('\n══════════════════════════════════════════════════════');
  console.log('✅  IMPORT COMPLETE');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Teachers : ${totalTeachers} total  (${savedTeachers.length} new)`);
  console.log(`  Students : ${totalStudents} total  (${savedStudents.length} new)`);
  console.log(`  Courses  : ${totalCourses} total`);
  console.log('\n  Credentials');
  console.log('  ─────────────────────────────────────────────────────');
  console.log('  Teachers → <name>.<faculty>@apollocollege.edu.np / teacher123');
  console.log('  Students → <name>.<id>@student.apollocollege.edu.np / student123');
  console.log('\n  Sample teacher logins (from first 6 new teachers):');
  savedTeachers.slice(0, 6).forEach(t => console.log(`    ${t.email}  /  teacher123`));
  console.log('\n  Sample student logins (from first 6 new students):');
  savedStudents.slice(0, 6).forEach(s => console.log(`    ${s.email}  /  student123`));
  console.log('══════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
