const express = require('express');
const xlsx = require('xlsx');
const Nomination = require('../models/Nomination');
const { sendNominationNotification, sendThankYouEmail } = require('../utils/mailer');

const router = express.Router();

const categoryLabel = {
  'feature-film': 'Feature film',
  'short-film': 'Short film',
  'video-song': 'Video song',
};

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

router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      email,
      category,
      contentName,
      contentUrl,
      releaseYear,
      addressLine1,
      city,
      state,
      zipCode,
      consent,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !category ||
      !contentName ||
      !contentUrl ||
      !releaseYear ||
      !addressLine1 ||
      !city ||
      !state ||
      !zipCode ||
      consent !== true
    ) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    const nomination = await Nomination.create({
      fullName,
      email,
      category,
      contentName,
      contentUrl,
      releaseYear,
      addressLine1,
      city,
      state,
      zipCode,
      consent,
    });

    const emailIssues = [];

    try {
      await sendNominationNotification(nomination);
    } catch (emailError) {
      console.error('Admin notification email failed:', emailError);
      emailIssues.push('admin notification');
    }

    try {
      await sendThankYouEmail(nomination);
    } catch (emailError) {
      console.error('Thank-you email failed:', emailError);
      emailIssues.push('thank-you email');
    }

    return res.status(201).json({
      success: true,
      message:
        emailIssues.length > 0
          ? 'Successfully submitted, but some emails could not be sent.'
          : 'Successfully submitted.',
      nomination,
      emailIssues,
    });
  } catch (error) {
    console.error('Nomination submission failed:', error);
    return res.status(500).json({
      message: 'Failed to submit nomination.',
    });
  }
});

router.get('/export', requireAdminToken, async (_req, res) => {
  try {
    const nominations = await Nomination.find().sort({ createdAt: -1 }).lean();

    const rows = nominations.map((nomination, index) => ({
      'S. No.': index + 1,
      'Full Name': nomination.fullName,
      Email: nomination.email,
      Category: categoryLabel[nomination.category] || nomination.category,
      'Content Name': nomination.contentName,
      'Content URL': nomination.contentUrl,
      'Release Year': nomination.releaseYear,
      'Address Line 1': nomination.addressLine1,
      City: nomination.city,
      State: nomination.state,
      'Zip Code': nomination.zipCode,
      Consent: nomination.consent ? 'Yes' : 'No',
      'Submitted At': nomination.createdAt ? new Date(nomination.createdAt).toLocaleString() : '',
      'Updated At': nomination.updatedAt ? new Date(nomination.updatedAt).toLocaleString() : '',
    }));

    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Nominations');

    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const fileName = `nomination-data-${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(buffer);
  } catch (error) {
    console.error('Nomination export failed:', error);
    return res.status(500).json({ message: 'Failed to export nomination data.' });
  }
});

module.exports = router;
