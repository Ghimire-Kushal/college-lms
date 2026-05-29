const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const STREAMS = ['Science', 'Management', 'Humanities', 'Education', 'Law'];

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'teacher', 'student'], required: true },

  // Student-specific
  rollNo:   String,
  grade:    { type: Number, enum: [11, 12] },   // Class 11 or 12
  stream:   { type: String, enum: STREAMS },     // Science / Management / Humanities…
  section:  String,                              // A, B, C

  // Teacher-specific
  teacherId:     String,
  department:    String,
  qualification: String,
  subjects:      [{ type: String }],

  // Shared
  phone:   String,
  address: String,
  avatar:  String,
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
