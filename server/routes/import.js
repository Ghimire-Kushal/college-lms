/**
 * Google Sheets → MongoDB student import route
 * POST /api/admin/import/students/google-sheets
 *
 * Expected sheet headers (row 1, case-insensitive):
 *   name | email | studentid | semester | section | phone | address | password
 *
 * Security:
 *  - Admin-only (JWT + role check)
 *  - Rate limited (5 syncs per admin per 15 min)
 *  - Credentials stay server-side only (env vars)
 *  - Full audit trail written to AuditLog collection
 */

const express    = require('express');
const router     = express.Router();
const path       = require('path');
const bcrypt     = require('bcryptjs');
const { google } = require('googleapis');
const rateLimit  = require('express-rate-limit');

const { auth, authorize } = require('../middleware/auth');
const User     = require('../models/User');
const AuditLog = require('../models/AuditLog');

// ── Middleware ────────────────────────────────────────────

const adminOnly = [auth, authorize('admin')];

// 5 sync attempts per admin per 15 minutes, keyed by authenticated user ID.
// Auth middleware runs first so req.user is always set on this route.
const syncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  // Key by user ID — avoids IPv6 issues and is more precise than IP
  keyGenerator: (req) => req.user?.id ?? 'unknown',
  validate: { xForwardedForHeader: false },
  handler: (_req, res) =>
    res.status(429).json({
      message: 'Too many sync requests. Please wait 15 minutes before retrying.',
    }),
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Helpers ───────────────────────────────────────────────

/**
 * Build a Google Sheets auth client from the service-account file
 * whose path is stored in GOOGLE_SERVICE_ACCOUNT_PATH (never the frontend).
 */
function buildSheetsClient() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
  if (!keyPath) throw new Error('GOOGLE_SERVICE_ACCOUNT_PATH is not set in environment');

  const resolvedPath = path.isAbsolute(keyPath)
    ? keyPath
    : path.join(__dirname, '..', keyPath);

  const auth = new google.auth.GoogleAuth({
    keyFile: resolvedPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

/**
 * Normalise a header string: lowercase, remove spaces/underscores.
 * e.g. "Student ID" → "studentid"
 */
const normalise = (s) => String(s ?? '').toLowerCase().replace(/[\s_-]/g, '');

/**
 * Map a raw sheet row (array) using the detected header→index map.
 */
function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => {
    obj[h] = String(row[i] ?? '').trim();
  });
  return obj;
}

/**
 * Validate one student row. Returns { valid: true } or { valid: false, reason }.
 */
function validateRow(obj, rowIndex) {
  if (!obj.name)      return { valid: false, reason: `Row ${rowIndex}: name is required` };
  if (!obj.email)     return { valid: false, reason: `Row ${rowIndex}: email is required` };
  if (!obj.studentid) return { valid: false, reason: `Row ${rowIndex}: studentId is required` };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(obj.email))
    return { valid: false, reason: `Row ${rowIndex}: invalid email "${obj.email}"` };

  if (obj.semester && isNaN(Number(obj.semester)))
    return { valid: false, reason: `Row ${rowIndex}: semester must be a number` };

  return { valid: true };
}

// ── Route ─────────────────────────────────────────────────

/**
 * POST /api/admin/import/students/google-sheets
 *
 * Response:
 * {
 *   summary: { total, imported, updated, skipped, errors },
 *   skippedDetails: [{ row, reason }],
 *   errorDetails:   [{ row, reason }],
 * }
 */
router.post(
  '/students/google-sheets',
  ...adminOnly,
  syncLimiter,
  async (req, res) => {
    const summary = { total: 0, imported: 0, updated: 0, skipped: 0, errors: 0 };
    const skippedDetails = [];
    const errorDetails   = [];

    try {
      // ── 1. Env-var checks ──────────────────────────────
      const sheetId = process.env.GOOGLE_SHEET_ID;
      const range   = process.env.GOOGLE_SHEET_RANGE || 'Students!A:J';

      if (!sheetId) {
        return res.status(500).json({ message: 'GOOGLE_SHEET_ID is not configured on the server.' });
      }

      // ── 2. Fetch sheet data ────────────────────────────
      let rows;
      try {
        const sheets = buildSheetsClient();
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range,
        });
        rows = response.data.values;
      } catch (sheetErr) {
        console.error('[Google Sheets] fetch error:', sheetErr.message);
        return res.status(502).json({
          message: 'Could not read Google Sheet. Check service-account permissions and GOOGLE_SHEET_ID.',
          detail: sheetErr.message,
        });
      }

      if (!rows || rows.length < 2) {
        return res.status(200).json({
          message: 'Sheet is empty or only contains a header row.',
          summary,
          skippedDetails,
          errorDetails,
        });
      }

      // ── 3. Parse headers (row 0) ───────────────────────
      const rawHeaders = rows[0];
      const normHeaders = rawHeaders.map(normalise);

      // Must have at minimum: name, email, studentid
      const required = ['name', 'email', 'studentid'];
      const missing  = required.filter(r => !normHeaders.includes(r));
      if (missing.length) {
        return res.status(400).json({
          message: `Google Sheet is missing required column(s): ${missing.join(', ')}`,
        });
      }

      const dataRows = rows.slice(1);
      summary.total  = dataRows.filter(r => r.some(c => String(c).trim())).length;

      // ── 4. Process each data row ───────────────────────
      for (let i = 0; i < dataRows.length; i++) {
        const rawRow  = dataRows[i];
        const rowNum  = i + 2; // 1-indexed + header offset

        // Skip fully empty rows
        if (!rawRow || !rawRow.some(c => String(c).trim())) continue;

        const obj = rowToObject(normHeaders, rawRow);

        // Validate
        const validation = validateRow(obj, rowNum);
        if (!validation.valid) {
          summary.skipped++;
          skippedDetails.push({ row: rowNum, reason: validation.reason });
          continue;
        }

        const email     = obj.email.toLowerCase();
        const studentId = obj.studentid;

        try {
          // Check for existing student by email OR studentId
          const existing = await User.findOne({
            role: 'student',
            $or: [{ email }, { studentId }],
          });

          if (existing) {
            // Update mutable fields only; never overwrite password from sheet
            let changed = false;
            const updates = {};

            if (existing.name !== obj.name && obj.name)           { updates.name = obj.name; changed = true; }
            if (obj.semester && existing.semester !== Number(obj.semester)) {
              updates.semester = Number(obj.semester); changed = true;
            }
            if (obj.section && existing.section !== obj.section)  { updates.section = obj.section; changed = true; }
            if (obj.phone   && existing.phone   !== obj.phone)    { updates.phone   = obj.phone;   changed = true; }
            if (obj.address && existing.address !== obj.address)  { updates.address = obj.address; changed = true; }

            if (changed) {
              await User.findByIdAndUpdate(existing._id, updates);
              summary.updated++;
            } else {
              summary.skipped++;
              skippedDetails.push({ row: rowNum, reason: `Duplicate (no changes): ${email}` });
            }
          } else {
            // Create new student
            // Default password: value from sheet column OR studentId (raw)
            const rawPassword = obj.password || studentId;
            const hashed      = await bcrypt.hash(rawPassword, 10);

            await User.create({
              name:      obj.name,
              email,
              password:  hashed,
              role:      'student',
              studentId,
              semester:  obj.semester ? Number(obj.semester) : undefined,
              section:   obj.section  || undefined,
              phone:     obj.phone    || undefined,
              address:   obj.address  || undefined,
              isActive:  true,
            });
            summary.imported++;
          }
        } catch (dbErr) {
          summary.errors++;
          errorDetails.push({
            row: rowNum,
            reason: dbErr.code === 11000
              ? `Duplicate key conflict for email "${email}" or studentId "${studentId}"`
              : dbErr.message,
          });
        }
      }

      // ── 5. Audit log ───────────────────────────────────
      const auditStatus =
        summary.errors > 0 && summary.imported + summary.updated === 0
          ? 'failed'
          : summary.errors > 0 || summary.skipped > 0
          ? 'partial'
          : 'success';

      await AuditLog.create({
        action:      'GOOGLE_SHEETS_IMPORT',
        performedBy: req.user.id,
        ipAddress:   req.ip,
        userAgent:   req.headers['user-agent'],
        status:      auditStatus,
        details: {
          sheetId,
          range,
          summary,
          skippedDetails: skippedDetails.slice(0, 50), // cap stored details
          errorDetails:   errorDetails.slice(0, 50),
        },
      });

      // ── 6. Respond ─────────────────────────────────────
      return res.status(200).json({
        message: `Sync complete — ${summary.imported} imported, ${summary.updated} updated, ${summary.skipped} skipped, ${summary.errors} error(s).`,
        summary,
        skippedDetails,
        errorDetails,
      });

    } catch (err) {
      console.error('[Google Sheets import] unexpected error:', err);

      // Still try to write a failed audit entry
      try {
        await AuditLog.create({
          action:      'GOOGLE_SHEETS_IMPORT',
          performedBy: req.user?.id,
          ipAddress:   req.ip,
          userAgent:   req.headers['user-agent'],
          status:      'failed',
          details:     { error: err.message, summary },
        });
      } catch (_) { /* audit write failure is non-fatal */ }

      return res.status(500).json({ message: 'Unexpected server error during sync.', detail: err.message });
    }
  }
);

module.exports = router;
