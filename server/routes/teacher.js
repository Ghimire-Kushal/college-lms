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
const Note = require('../models/Note');
const OnlineClass    = require('../models/OnlineClass');
const Notification   = require('../models/Notification');

const teacherAuth = [auth, authorize('teacher', 'admin')];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Dashboard
router.get('/dashboard', ...teacherAuth, async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id, isActive: true })
      .populate('students', 'name');

    const totalStudents = courses.reduce((sum, c) => sum + c.students.length, 0);

    const recentAttendance = await Attendance.find({ takenBy: req.user.id })
      .populate('course', 'name code')
      .sort({ date: -1 })
      .limit(5);

    const recentAssignments = await Assignment.find({ teacher: req.user.id })
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);

    const pendingSubmissions = await Submission.countDocuments({
      assignment: { $in: recentAssignments.map(a => a._id) },
      status: 'submitted',
    });

    res.json({
      totalStudents,
      totalCourses: courses.length,
      pendingSubmissions,
      courses,
      recentAttendance,
      recentAssignments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get teacher's courses
router.get('/courses', ...teacherAuth, async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id, isActive: true })
      .populate('students', 'name email studentId');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== ATTENDANCE =====
router.get('/attendance', ...teacherAuth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = { takenBy: req.user.id };
    if (courseId) query.course = courseId;

    const records = await Attendance.find(query)
      .populate('course', 'name code')
      .populate('records.student', 'name studentId')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const statusLabel = (s) => s === 'present' ? 'Present ✓' : s === 'late' ? 'Late ⚠' : 'Absent ✗';
const statusMsg   = (s, course, date) => {
  const d = new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  if (s === 'present') return `You were marked Present in ${course} on ${d}.`;
  if (s === 'late')    return `You were marked Late in ${course} on ${d}. Please be on time.`;
  return `You were marked Absent in ${course} on ${d}. Contact your teacher if needed.`;
};

router.post('/attendance', ...teacherAuth, async (req, res) => {
  try {
    const { courseId, date, records } = req.body;

    const existing = await Attendance.findOne({ course: courseId, date: new Date(date) });
    if (existing) return res.status(400).json({ message: 'Attendance already taken for this date' });

    const attendance = new Attendance({
      course: courseId,
      date: new Date(date),
      takenBy: req.user.id,
      records,
    });
    await attendance.save();
    await attendance.populate([
      { path: 'course', select: 'name code' },
      { path: 'records.student', select: 'name studentId' },
    ]);

    // Send notification to each student
    const courseName = attendance.course?.name || 'your course';
    await Notification.insertMany(
      attendance.records.map(r => ({
        user:    r.student,
        title:   `Attendance: ${statusLabel(r.status)}`,
        message: statusMsg(r.status, courseName, date),
        type:    'attendance',
        meta:    { attendanceId: attendance._id, courseId, status: r.status },
      }))
    );

    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/attendance/:id', ...teacherAuth, async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('course', 'name code')
      .populate('records.student', 'name studentId');

    // Update notifications for edited attendance
    const courseName = record.course?.name || 'your course';
    await Promise.all(
      record.records.map(r =>
        Notification.create({
          user:    r.student,
          title:   `Attendance Updated: ${statusLabel(r.status)}`,
          message: `Your attendance in ${courseName} on ${new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} was updated to ${r.status}.`,
          type:    'attendance',
          meta:    { attendanceId: record._id, status: r.status },
        })
      )
    );

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/attendance/summary/:courseId', ...teacherAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('students', 'name studentId email');
    const records = await Attendance.find({ course: req.params.courseId });

    const summary = course.students.map(student => {
      let present = 0, absent = 0, late = 0;
      records.forEach(record => {
        const sr = record.records.find(r => r.student.toString() === student._id.toString());
        if (sr) {
          if (sr.status === 'present') present++;
          else if (sr.status === 'absent') absent++;
          else if (sr.status === 'late') late++;
        }
      });
      const total = present + absent + late;
      return {
        student,
        total,
        present,
        absent,
        late,
        percentage: total > 0 ? ((present + late * 0.5) / total * 100).toFixed(1) : 0,
      };
    });

    res.json({ course, summary, totalClasses: records.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== NOTES =====
router.get('/notes', ...teacherAuth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = { teacher: req.user.id };
    if (courseId) query.course = courseId;

    const notes = await Note.find(query)
      .populate('course', 'name code')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/notes', ...teacherAuth, upload.single('file'), async (req, res) => {
  try {
    const noteData = {
      title: req.body.title,
      description: req.body.description,
      course: req.body.courseId,
      teacher: req.user.id,
    };
    if (req.file) {
      noteData.fileUrl = `/uploads/${req.file.filename}`;
      noteData.fileName = req.file.originalname;
      noteData.fileType = req.file.mimetype;
    }
    const note = new Note(noteData);
    await note.save();
    await note.populate('course', 'name code');
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/notes/:id', ...teacherAuth, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== ASSIGNMENTS =====
router.get('/assignments', ...teacherAuth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = { teacher: req.user.id };
    if (courseId) query.course = courseId;

    const assignments = await Assignment.find(query)
      .populate('course', 'name code')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/assignments', ...teacherAuth, upload.single('file'), async (req, res) => {
  try {
    const data = {
      title: req.body.title,
      description: req.body.description,
      course: req.body.courseId,
      teacher: req.user.id,
      dueDate: req.body.dueDate,
      totalMarks: req.body.totalMarks,
    };
    if (req.file) data.fileUrl = `/uploads/${req.file.filename}`;

    const assignment = new Assignment(data);
    await assignment.save();
    await assignment.populate('course', 'name code');
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/assignments/:id', ...teacherAuth, async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('course', 'name code');
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/assignments/:id', ...teacherAuth, async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/assignments/:id/submissions', ...teacherAuth, async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name studentId email')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/submissions/:id/grade', ...teacherAuth, async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { marks, feedback, status: 'graded' },
      { new: true }
    ).populate('student', 'name studentId');
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== RESULTS =====
router.get('/results', ...teacherAuth, async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id });
    const courseIds = courses.map(c => c._id);
    const { courseId } = req.query;

    const results = await Result.find({ course: courseId ? courseId : { $in: courseIds } })
      .populate('student', 'name studentId')
      .populate('course', 'name code')
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/results', ...teacherAuth, async (req, res) => {
  try {
    const result = new Result({ ...req.body, publishedBy: req.user.id });
    await result.save();
    await result.populate([{ path: 'student', select: 'name studentId' }, { path: 'course', select: 'name code' }]);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/results/:id', ...teacherAuth, async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student', 'name studentId')
      .populate('course', 'name code');
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== NOTICES =====
router.get('/notices', ...teacherAuth, async (req, res) => {
  try {
    const notices = await Notice.find({ postedBy: req.user.id, isActive: true })
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/notices', ...teacherAuth, async (req, res) => {
  try {
    const notice = new Notice({ ...req.body, postedBy: req.user.id });
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/notices/:id', ...teacherAuth, async (req, res) => {
  try {
    await Notice.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Notice removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== ONLINE CLASSES =====
router.get('/online-classes', ...teacherAuth, async (req, res) => {
  try {
    const classes = await OnlineClass.find({ teacher: req.user.id })
      .populate('course', 'name code')
      .sort({ scheduledAt: 1 });
    res.json(classes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/online-classes', ...teacherAuth, async (req, res) => {
  try {
    const cls = new OnlineClass({ ...req.body, teacher: req.user.id });
    await cls.save();
    await cls.populate('course', 'name code');
    res.status(201).json(cls);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/online-classes/:id', ...teacherAuth, async (req, res) => {
  try {
    const cls = await OnlineClass.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user.id },
      req.body, { new: true }
    ).populate('course', 'name code');
    if (!cls) return res.status(404).json({ message: 'Not found' });
    res.json(cls);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/online-classes/:id', ...teacherAuth, async (req, res) => {
  try {
    await OnlineClass.findOneAndDelete({ _id: req.params.id, teacher: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
