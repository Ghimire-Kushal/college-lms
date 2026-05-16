const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',              require('./routes/auth'));
app.use('/api/admin',             require('./routes/admin'));
app.use('/api/admin/import',      require('./routes/import'));
app.use('/api/teacher',           require('./routes/teacher'));
app.use('/api/student',           require('./routes/student'));
app.use('/api/notifications',     require('./routes/notifications'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'EduTrack LMS API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
