const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Notice = require('./models/Notice');

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Notice.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create Admin
  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@edutrack.com',
    password: 'admin123',
    role: 'admin',
  });

  // Create Teachers
  const teacher1 = await User.create({
    name: 'Dr. Ramesh Sharma',
    email: 'teacher@edutrack.com',
    password: 'teacher123',
    role: 'teacher',
    teacherId: 'TCH001',
    phone: '9800000001',
  });

  const teacher2 = await User.create({
    name: 'Ms. Sita Rai',
    email: 'sita@edutrack.com',
    password: 'teacher123',
    role: 'teacher',
    teacherId: 'TCH002',
    phone: '9800000002',
  });

  // Create Students
  const student1 = await User.create({
    name: 'Aarav Thapa',
    email: 'student@edutrack.com',
    password: 'student123',
    role: 'student',
    studentId: 'STU001',
    semester: 3,
    section: 'A',
    phone: '9800000010',
  });

  const student2 = await User.create({
    name: 'Priya Shrestha',
    email: 'priya@edutrack.com',
    password: 'student123',
    role: 'student',
    studentId: 'STU002',
    semester: 3,
    section: 'A',
    phone: '9800000011',
  });

  const student3 = await User.create({
    name: 'Bikash Karki',
    email: 'bikash@edutrack.com',
    password: 'student123',
    role: 'student',
    studentId: 'STU003',
    semester: 3,
    section: 'B',
    phone: '9800000012',
  });

  // Create Courses
  const course1 = await Course.create({
    name: 'Database Management System',
    code: 'DBMS301',
    description: 'Fundamentals of relational and NoSQL databases.',
    credits: 3,
    semester: 3,
    section: 'A',
    teacher: teacher1._id,
    students: [student1._id, student2._id],
  });

  const course2 = await Course.create({
    name: 'Web Technology',
    code: 'WT302',
    description: 'HTML, CSS, JavaScript and modern web frameworks.',
    credits: 3,
    semester: 3,
    section: 'A',
    teacher: teacher2._id,
    students: [student1._id, student2._id],
  });

  const course3 = await Course.create({
    name: 'Data Structures & Algorithms',
    code: 'DSA303',
    description: 'Fundamental data structures and algorithm design.',
    credits: 4,
    semester: 3,
    section: 'B',
    teacher: teacher1._id,
    students: [student3._id],
  });

  // Enroll students in their courses
  await User.findByIdAndUpdate(student1._id, { enrolledCourses: [course1._id, course2._id] });
  await User.findByIdAndUpdate(student2._id, { enrolledCourses: [course1._id, course2._id] });
  await User.findByIdAndUpdate(student3._id, { enrolledCourses: [course3._id] });

  // Create Notices
  await Notice.create([
    {
      title: 'Welcome to EduTrack LMS',
      content: 'Welcome to the new semester! All course materials and attendance will be managed through this portal.',
      postedBy: admin._id,
      targetRole: 'all',
    },
    {
      title: 'Mid-term Examination Schedule',
      content: 'Mid-term examinations will be held from the 15th to 20th of next month. Please check your timetable.',
      postedBy: admin._id,
      targetRole: 'student',
    },
    {
      title: 'Assignment Submission Reminder',
      content: 'All pending assignments must be submitted before the deadline. Late submissions will not be accepted.',
      postedBy: teacher1._id,
      targetRole: 'student',
    },
  ]);

  console.log('\n✅ Seed complete! Demo accounts created:');
  console.log('─────────────────────────────────────────');
  console.log('Admin    → admin@edutrack.com     / admin123');
  console.log('Teacher  → teacher@edutrack.com   / teacher123');
  console.log('Teacher2 → sita@edutrack.com      / teacher123');
  console.log('Student  → student@edutrack.com   / student123');
  console.log('Student2 → priya@edutrack.com     / student123');
  console.log('Student3 → bikash@edutrack.com    / student123');
  console.log('─────────────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
