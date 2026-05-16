const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Notice = require('../models/Notice');
const Result = require('../models/Result');
const Timetable = require('../models/Timetable');
const Feedback = require('../models/Feedback');

const adminOnly = [auth, authorize('admin')];

// Dashboard
router.get('/dashboard', ...adminOnly, async (req, res) => {
  try {
    const [totalStudents, totalTeachers, totalCourses, totalNotices] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'teacher', isActive: true }),
      Course.countDocuments({ isActive: true }),
      Notice.countDocuments({ isActive: true }),
    ]);

    const recentStudents = await User.find({ role: 'student', isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email studentId semester section createdAt');

    const recentNotices = await Notice.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('postedBy', 'name');

    const teachers = await User.find({ role: 'teacher', isActive: true })
      .sort({ createdAt: -1 })
      .select('name email employeeId department qualification createdAt');

    res.json({ totalStudents, totalTeachers, totalCourses, totalNotices, recentStudents, recentNotices, teachers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== STUDENTS =====
router.get('/students', ...adminOnly, async (req, res) => {
  try {
    const { search, semester, section } = req.query;
    const query = { role: 'student' };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
    ];
    if (semester) query.semester = semester;
    if (section) query.section = section;

    const students = await User.find(query)
      .select('-password')
      .populate('enrolledCourses', 'name code')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/students', ...adminOnly, async (req, res) => {
  try {
    const student = new User({ ...req.body, role: 'student' });
    await student.save();
    const result = student.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/students/:id', ...adminOnly, async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select('-password')
      .populate('enrolledCourses', 'name code teacher');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/students/:id', ...adminOnly, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    if (password) {
      const user = await User.findById(req.params.id);
      user.password = password;
      await user.save();
    }
    const student = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/students/:id', ...adminOnly, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Student deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/students/:id/enroll', ...adminOnly, async (req, res) => {
  try {
    const { courseId } = req.body;
    await User.findByIdAndUpdate(req.params.id, { $addToSet: { enrolledCourses: courseId } });
    await Course.findByIdAndUpdate(courseId, { $addToSet: { students: req.params.id } });
    res.json({ message: 'Student enrolled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/students/:id/enroll/:courseId', ...adminOnly, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { $pull: { enrolledCourses: req.params.courseId } });
    await Course.findByIdAndUpdate(req.params.courseId, { $pull: { students: req.params.id } });
    res.json({ message: 'Student unenrolled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== TEACHERS =====
router.get('/teachers', ...adminOnly, async (req, res) => {
  try {
    const { search } = req.query;
    const query = { role: 'teacher' };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { teacherId: { $regex: search, $options: 'i' } },
    ];
    const teachers = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/teachers', ...adminOnly, async (req, res) => {
  try {
    const teacher = new User({ ...req.body, role: 'teacher' });
    await teacher.save();
    const result = teacher.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/teachers/:id', ...adminOnly, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    if (password) {
      const user = await User.findById(req.params.id);
      user.password = password;
      await user.save();
    }
    const teacher = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/teachers/:id', ...adminOnly, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Teacher deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== COURSES =====
router.get('/courses', ...adminOnly, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'name email')
      .populate('students', 'name studentId')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/courses', ...adminOnly, async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/courses/:id', ...adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('teacher', 'name email');
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/courses/:id', ...adminOnly, async (req, res) => {
  try {
    await Course.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Course deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/courses/:id/assign-teacher', ...adminOnly, async (req, res) => {
  try {
    const { teacherId } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { teacher: teacherId },
      { new: true }
    ).populate('teacher', 'name email');
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== TIMETABLE =====
router.get('/timetable', ...adminOnly, async (req, res) => {
  try {
    const { semester, section } = req.query;
    const query = {};
    if (semester) query.semester = semester;
    if (section) query.section = section;

    const timetable = await Timetable.find(query)
      .populate('course', 'name code')
      .populate('teacher', 'name')
      .sort({ dayOfWeek: 1, startTime: 1 });
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/timetable', ...adminOnly, async (req, res) => {
  try {
    const entry = new Timetable(req.body);
    await entry.save();
    await entry.populate([{ path: 'course', select: 'name code' }, { path: 'teacher', select: 'name' }]);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/timetable/:id', ...adminOnly, async (req, res) => {
  try {
    const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('course', 'name code')
      .populate('teacher', 'name');
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/timetable/:id', ...adminOnly, async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Timetable entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== NOTICES =====
router.get('/notices', ...adminOnly, async (req, res) => {
  try {
    const notices = await Notice.find({ isActive: true })
      .populate('postedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/notices', ...adminOnly, async (req, res) => {
  try {
    const notice = new Notice({ ...req.body, postedBy: req.user.id });
    await notice.save();
    await notice.populate('postedBy', 'name role');
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/notices/:id', ...adminOnly, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('postedBy', 'name role');
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/notices/:id', ...adminOnly, async (req, res) => {
  try {
    await Notice.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Notice removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== ATTENDANCE REPORTS =====
router.get('/attendance', ...adminOnly, async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;
    const query = {};
    if (courseId) query.course = courseId;
    if (startDate && endDate) query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const attendance = await Attendance.find(query)
      .populate('course', 'name code')
      .populate('takenBy', 'name')
      .populate('records.student', 'name studentId')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/attendance/summary/:studentId', ...adminOnly, async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId)
      .select('-password')
      .populate('enrolledCourses', 'name code');

    const attendanceRecords = await Attendance.find({ 'records.student': req.params.studentId })
      .populate('course', 'name code');

    const summary = {};
    attendanceRecords.forEach(record => {
      const courseId = record.course._id.toString();
      if (!summary[courseId]) {
        summary[courseId] = { course: record.course, total: 0, present: 0, absent: 0, late: 0 };
      }
      const sr = record.records.find(r => r.student.toString() === req.params.studentId);
      if (sr) {
        summary[courseId].total++;
        summary[courseId][sr.status]++;
      }
    });

    res.json({ student, summary: Object.values(summary) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== RESULTS =====
router.get('/results', ...adminOnly, async (req, res) => {
  try {
    const { semester, courseId } = req.query;
    const query = {};
    if (semester) query.semester = semester;
    if (courseId) query.course = courseId;

    const results = await Result.find(query)
      .populate('student', 'name studentId semester section')
      .populate('course', 'name code')
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/results', ...adminOnly, async (req, res) => {
  try {
    const result = new Result({ ...req.body, publishedBy: req.user.id });
    await result.save();
    await result.populate([{ path: 'student', select: 'name studentId' }, { path: 'course', select: 'name code' }]);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/results/:id', ...adminOnly, async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student', 'name studentId')
      .populate('course', 'name code');
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/results/:id', ...adminOnly, async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ message: 'Result deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== FEEDBACK =====
router.get('/feedback', ...adminOnly, async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    const feedbacks = await Feedback.find(query)
      .populate('student', 'name studentId semester section')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/feedback/:id', ...adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'resolved'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });
    const fb = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('student', 'name studentId semester section');
    if (!fb) return res.status(404).json({ message: 'Feedback not found' });
    res.json(fb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/feedback/:id', ...adminOnly, async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
