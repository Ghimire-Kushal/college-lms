const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Notice = require('./models/Notice');

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Promise.all([User.deleteMany({}), Course.deleteMany({}), Notice.deleteMany({})]);
  console.log('Cleared existing data');

  // ── Admin ────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Super Admin', email: 'admin@edutrack.com',
    password: 'admin123', role: 'admin',
  });

  // ── Teachers ─────────────────────────────────────────────
  const teacher1 = await User.create({
    name: 'Mr. Rajesh Poudel', email: 'teacher@edutrack.com',
    password: 'teacher123', role: 'teacher', teacherId: 'TCH001',
    department: 'Science', qualification: 'M.Sc. Physics',
    subjects: ['Physics', 'Mathematics', 'Computer Science'],
    phone: '9841000001',
  });

  const teacher2 = await User.create({
    name: 'Ms. Anita Shrestha', email: 'anita@edutrack.com',
    password: 'teacher123', role: 'teacher', teacherId: 'TCH002',
    department: 'Management', qualification: 'M.Com. Accountancy',
    subjects: ['Accountancy', 'Economics', 'Business Studies'],
    phone: '9841000002',
  });

  const teacher3 = await User.create({
    name: 'Mr. Bijay Tamang', email: 'bijay@edutrack.com',
    password: 'teacher123', role: 'teacher', teacherId: 'TCH003',
    department: 'Languages', qualification: 'M.A. English',
    subjects: ['English', 'Nepali'],
    phone: '9841000003',
  });

  // ── Students — Class 11 Science ──────────────────────────
  const s11sc1 = await User.create({
    name: 'Aarav Thapa', email: 'student@edutrack.com',
    password: 'student123', role: 'student',
    rollNo: '11-SCI-001', grade: 11, stream: 'Science', section: 'A',
    phone: '9841100001',
  });
  const s11sc2 = await User.create({
    name: 'Priya Shrestha', email: 'priya@edutrack.com',
    password: 'student123', role: 'student',
    rollNo: '11-SCI-002', grade: 11, stream: 'Science', section: 'A',
    phone: '9841100002',
  });
  const s11sc3 = await User.create({
    name: 'Suman Gurung', email: 'suman@edutrack.com',
    password: 'student123', role: 'student',
    rollNo: '11-SCI-003', grade: 11, stream: 'Science', section: 'B',
    phone: '9841100003',
  });

  // ── Students — Class 11 Management ───────────────────────
  const s11mg1 = await User.create({
    name: 'Riya Maharjan', email: 'riya@edutrack.com',
    password: 'student123', role: 'student',
    rollNo: '11-MGT-001', grade: 11, stream: 'Management', section: 'A',
    phone: '9841100004',
  });
  const s11mg2 = await User.create({
    name: 'Bikash Karki', email: 'bikash@edutrack.com',
    password: 'student123', role: 'student',
    rollNo: '11-MGT-002', grade: 11, stream: 'Management', section: 'A',
    phone: '9841100005',
  });

  // ── Students — Class 12 Science ──────────────────────────
  const s12sc1 = await User.create({
    name: 'Anish Khatri', email: 'anish@edutrack.com',
    password: 'student123', role: 'student',
    rollNo: '12-SCI-001', grade: 12, stream: 'Science', section: 'A',
    phone: '9841200001',
  });
  const s12sc2 = await User.create({
    name: 'Nisha Bajracharya', email: 'nisha@edutrack.com',
    password: 'student123', role: 'student',
    rollNo: '12-SCI-002', grade: 12, stream: 'Science', section: 'A',
    phone: '9841200002',
  });

  // ── Students — Class 12 Management ───────────────────────
  const s12mg1 = await User.create({
    name: 'Sandip Lama', email: 'sandip@edutrack.com',
    password: 'student123', role: 'student',
    rollNo: '12-MGT-001', grade: 12, stream: 'Management', section: 'A',
    phone: '9841200003',
  });

  // ── Courses — Class 11 Science ───────────────────────────
  const c11Phy = await Course.create({
    name: 'Physics', code: '11-PHY-A', grade: 11, stream: 'Science', section: 'A',
    description: 'Mechanics, Thermodynamics, Optics and Modern Physics.',
    teacher: teacher1._id,
    students: [s11sc1._id, s11sc2._id],
  });
  const c11Chem = await Course.create({
    name: 'Chemistry', code: '11-CHM-A', grade: 11, stream: 'Science', section: 'A',
    description: 'Physical, Organic and Inorganic Chemistry fundamentals.',
    teacher: teacher1._id,
    students: [s11sc1._id, s11sc2._id],
  });
  const c11Math = await Course.create({
    name: 'Mathematics', code: '11-MTH-A', grade: 11, stream: 'Science', section: 'A',
    description: 'Algebra, Trigonometry, Calculus and Statistics.',
    teacher: teacher1._id,
    students: [s11sc1._id, s11sc2._id],
  });
  const c11Eng = await Course.create({
    name: 'English', code: '11-ENG-A', grade: 11, stream: 'Science', section: 'A',
    description: 'English language, literature and writing skills.',
    teacher: teacher3._id,
    students: [s11sc1._id, s11sc2._id],
  });
  const c11CS = await Course.create({
    name: 'Computer Science', code: '11-CS-B', grade: 11, stream: 'Science', section: 'B',
    description: 'Programming, data structures and computer fundamentals.',
    teacher: teacher1._id,
    students: [s11sc3._id],
  });

  // ── Courses — Class 11 Management ────────────────────────
  const c11Acc = await Course.create({
    name: 'Accountancy', code: '11-ACC-A', grade: 11, stream: 'Management', section: 'A',
    description: 'Basic accounting principles and financial statements.',
    teacher: teacher2._id,
    students: [s11mg1._id, s11mg2._id],
  });
  const c11Eco = await Course.create({
    name: 'Economics', code: '11-ECO-A', grade: 11, stream: 'Management', section: 'A',
    description: 'Micro and macroeconomics concepts.',
    teacher: teacher2._id,
    students: [s11mg1._id, s11mg2._id],
  });

  // ── Courses — Class 12 Science ───────────────────────────
  const c12Phy = await Course.create({
    name: 'Physics', code: '12-PHY-A', grade: 12, stream: 'Science', section: 'A',
    description: 'Advanced mechanics, electromagnetism and modern physics.',
    teacher: teacher1._id,
    students: [s12sc1._id, s12sc2._id],
  });
  const c12Chem = await Course.create({
    name: 'Chemistry', code: '12-CHM-A', grade: 12, stream: 'Science', section: 'A',
    description: 'Advanced organic, inorganic and analytical chemistry.',
    teacher: teacher1._id,
    students: [s12sc1._id, s12sc2._id],
  });

  // ── Courses — Class 12 Management ────────────────────────
  const c12Acc = await Course.create({
    name: 'Accountancy', code: '12-ACC-A', grade: 12, stream: 'Management', section: 'A',
    description: 'Advanced accounting and auditing principles.',
    teacher: teacher2._id,
    students: [s12mg1._id],
  });

  // ── Enroll students ───────────────────────────────────────
  await User.findByIdAndUpdate(s11sc1._id, { enrolledCourses: [c11Phy._id, c11Chem._id, c11Math._id, c11Eng._id] });
  await User.findByIdAndUpdate(s11sc2._id, { enrolledCourses: [c11Phy._id, c11Chem._id, c11Math._id, c11Eng._id] });
  await User.findByIdAndUpdate(s11sc3._id, { enrolledCourses: [c11CS._id] });
  await User.findByIdAndUpdate(s11mg1._id, { enrolledCourses: [c11Acc._id, c11Eco._id] });
  await User.findByIdAndUpdate(s11mg2._id, { enrolledCourses: [c11Acc._id, c11Eco._id] });
  await User.findByIdAndUpdate(s12sc1._id, { enrolledCourses: [c12Phy._id, c12Chem._id] });
  await User.findByIdAndUpdate(s12sc2._id, { enrolledCourses: [c12Phy._id, c12Chem._id] });
  await User.findByIdAndUpdate(s12mg1._id, { enrolledCourses: [c12Acc._id] });

  // ── Notices ───────────────────────────────────────────────
  await Notice.create([
    {
      title: 'Welcome to Canvas Academy Udayapur',
      content: 'Welcome to the new academic session 2081/82! All students are required to log in and verify their class and stream details.',
      postedBy: admin._id, targetRole: 'all',
    },
    {
      title: 'First Terminal Examination Schedule',
      content: 'First terminal examinations will be held from Aswin 15 to Aswin 25. Students must carry their admit cards.',
      postedBy: admin._id, targetRole: 'student',
    },
    {
      title: 'Assignment Submission Deadline',
      content: 'All pending assignments must be submitted before Aswin 10. Late submissions will attract a 20% marks deduction.',
      postedBy: teacher1._id, targetRole: 'student',
    },
    {
      title: 'Fee Payment Notice',
      content: 'Second installment of tuition fee is due by end of this month. Students with pending fees will not be allowed to sit the terminal exam.',
      postedBy: admin._id, targetRole: 'student',
    },
  ]);

  console.log('\n✅ Seed complete — Canvas Academy Udayapur data loaded');
  console.log('──────────────────────────────────────────────────');
  console.log('Admin    → admin@edutrack.com    / admin123');
  console.log('Teacher  → teacher@edutrack.com  / teacher123  (Science)');
  console.log('Teacher  → anita@edutrack.com    / teacher123  (Management)');
  console.log('Student  → student@edutrack.com  / student123  (Class 11 Science)');
  console.log('Student  → priya@edutrack.com    / student123  (Class 11 Science)');
  console.log('Student  → riya@edutrack.com     / student123  (Class 11 Management)');
  console.log('Student  → anish@edutrack.com    / student123  (Class 12 Science)');
  console.log('──────────────────────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
