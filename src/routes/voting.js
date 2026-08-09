const express = require('express');
const xlsx = require('xlsx');
const Vote = require('../models/Vote');

const router = express.Router();

const requireAdminToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization || '';
  const token = authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : req.headers['x-admin-token'];

  if (!token || token !== process.env.ADMIN_ACCESS_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized access.' });
  }

  return next();
};

// Check voting eligibility by Email or IP
router.post('/check-eligibility', async (req, res) => {
  try {
    const { email, ip } = req.body;
    const emailTrimmed = (email || '').trim().toLowerCase();

    if (emailTrimmed) {
      const existingEmail = await Vote.findOne({ email: emailTrimmed });
      if (existingEmail) {
        return res.json({
          allowed: false,
          message: `You already voted with email "${emailTrimmed}".`,
        });
      }
    }

    if (ip) {
      const existingIp = await Vote.findOne({ ip });
      if (existingIp) {
        return res.json({
          allowed: false,
          message: `You already voted from network IP (${ip}).`,
        });
      }
    }

    return res.json({ allowed: true });
  } catch (error) {
    return res.json({ allowed: true });
  }
});

// Submit vote
router.post('/', async (req, res) => {
  try {
    const { fullName, email, ip, votes } = req.body;

    if (!fullName || !email || !votes || !Array.isArray(votes) || votes.length === 0) {
      return res.status(400).json({ message: 'Please fill all required fields and cast votes.' });
    }

    const emailTrimmed = email.trim().toLowerCase();

    // Check if email already voted in DB
    const existingVoteByEmail = await Vote.findOne({ email: emailTrimmed });
    if (existingVoteByEmail) {
      return res.status(400).json({ message: `You already voted with email "${emailTrimmed}".` });
    }

    // Check if IP already voted in DB
    if (ip) {
      const existingVoteByIp = await Vote.findOne({ ip });
      if (existingVoteByIp) {
        return res.status(400).json({ message: `You already voted from network IP (${ip}).` });
      }
    }

    const newVote = await Vote.create({
      fullName: fullName.trim(),
      email: emailTrimmed,
      ip: ip ? ip.trim() : '',
      votes,
    });

    return res.status(201).json({
      success: true,
      message: 'Vote submitted successfully.',
      vote: newVote,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You already voted from this email address or network IP.',
      });
    }
    console.error('Voting submission failed:', error);
    return res.status(500).json({ message: 'Failed to submit vote.' });
  }
});

// Admin export to Excel
router.get('/export', requireAdminToken, async (_req, res) => {
  try {
    const votesList = await Vote.find().sort({ createdAt: -1 }).lean();

    const rows = votesList.map((v, index) => {
      const row = {
        'S. No.': index + 1,
        'Full Name': v.fullName,
        Email: v.email,
        'IP Address': v.ip || '',
        'Submitted At': v.createdAt ? new Date(v.createdAt).toLocaleString() : '',
      };

      // Map each category vote into its own column
      if (Array.isArray(v.votes)) {
        v.votes.forEach(item => {
          if (item.categoryName) {
            row[item.categoryName] = item.nomineeName
              ? `${item.nomineeName}${item.nomineePurpose ? ` (${item.nomineePurpose})` : ''}`
              : '';
          }
        });
      }

      return row;
    });

    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Voting Data');

    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const fileName = `voting-data-${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(buffer);
  } catch (error) {
    console.error('Voting export failed:', error);
    return res.status(500).json({ message: 'Failed to export voting data.' });
  }
});

module.exports = router;
