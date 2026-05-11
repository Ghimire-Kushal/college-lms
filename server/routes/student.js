const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Notice = require('../models/Notice');
const Result = require('../models/Result');
const Timetable = require('../models/Timetable');
const Note = require('../models/Note');

const studentAuth = [auth, authorize('student', 'admin')];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Dashboard
router.get('/dashboard', ...studentAuth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate('enrolledCourses', 'name code');

    const attendanceRecords = await Attendance.find({ 'records.student': req.user.id });
    let totalClasses = 0, presentClasses = 0;
    attendanceRecords.forEach(record => {
      const sr = record.records.find(r => r.student.toString() === req.user.id);
      if (sr) {
        totalClasses++;
        if (sr.status === 'present' || sr.status === 'late') presentClasses++;
      }
    });

    const upcomingAssignments = await Assignment.find({
      course: { $in: student.enrolledCourses },
      dueDate: { $gte: new Date() },
    }).populate('course', 'name code').sort({ dueDate: 1 }).limit(5);

    const notices = await Notice.find({
      isActive: true,
      $or: [{ targetRole: 'all' }, { targetRole: 'student' }],
    }).sort({ createdAt: -1 }).limit(5);

    res.json({
      totalCourses: student.enrolledCourses.length,
      attendancePercentage: totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(1) : 0,
      totalClasses,
      presentClasses,
      upcomingAssignments,
      notices,
      courses: student.enrolledCourses,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Enrolled courses
router.get('/courses', ...studentAuth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate({
      path: 'enrolledCourses',
      populate: { path: 'teacher', select: 'name email' },
    });
    res.json(student.enrolledCourses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== ATTENDANCE =====
router.get('/attendance', ...studentAuth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate('enrolledCourses', 'name code');
    const attendanceRecords = await Attendance.find({ 'records.student': req.user.id })
      .populate('course', 'name code')
      .sort({ date: -1 });

    const courseSummary = {};
    student.enrolledCourses.forEach(course => {
      courseSummary[course._id.toString()] = { course, total: 0, present: 0, absent: 0, late: 0, records: [] };
    });

    attendanceRecords.forEach(record => {
      const courseId = record.course._id.toString();
      if (courseSummary[courseId]) {
        const sr = record.records.find(r => r.student.toString() === req.user.id);
        if (sr) {
          courseSummary[courseId].total++;
          courseSummary[courseId][sr.status]++;
          courseSummary[courseId].records.push({ date: record.date, status: sr.status });
        }
      }
    });

    const summary = Object.values(courseSummary).map(item => ({
      ...item,
      percentage: item.total > 0 ? ((item.present + item.late * 0.5) / item.total * 100).toFixed(1) : 0,
    }));

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== NOTES =====
router.get('/notes', ...studentAuth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    const { courseId } = req.query;
    const query = { course: courseId ? courseId : { $in: student.enrolledCourses } };

    const notes = await Note.find(query)
      .populate('course', 'name code')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== ASSIGNMENTS =====
router.get('/assignments', ...studentAuth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    const assignments = await Assignment.find({ course: { $in: student.enrolledCourses } })
      .populate('course', 'name code')
      .populate('teacher', 'name')
      .sort({ dueDate: 1 });

    const submissions = await Submission.find({ student: req.user.id });
    const submissionMap = {};
    submissions.forEach(sub => { submissionMap[sub.assignment.toString()] = sub; });

    const result = assignments.map(a => ({
      ...a.toObject(),
      submission: submissionMap[a._id.toString()] || null,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/assignments/:id/submit', ...studentAuth, upload.single('file'), async (req, res) => {
  try {
    const existing = await Submission.findOne({ assignment: req.params.id, student: req.user.id });
    if (existing) return res.status(400).json({ message: 'Already submitted' });

    const submission = new Submission({
      assignment: req.params.id,
      student: req.user.id,
      content: req.body.content,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
    });
    await submission.save();
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== RESULTS =====
router.get('/results', ...studentAuth, async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate('course', 'name code credits')
      .sort({ semester: 1, createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== TIMETABLE =====
router.get('/timetable', ...studentAuth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    const timetable = await Timetable.find({ semester: student.semester, section: student.section })
      .populate('course', 'name code')
      .populate('teacher', 'name')
      .sort({ startTime: 1 });
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== NOTICES =====
router.get('/notices', ...studentAuth, async (req, res) => {
  try {
    const notices = await Notice.find({
      isActive: true,
      $or: [{ targetRole: 'all' }, { targetRole: 'student' }],
    }).populate('postedBy', 'name role').sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
