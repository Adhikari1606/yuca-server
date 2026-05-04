const express = require('express');
const { sendContactNotification, sendContactThankYou } = require('../utils/mailer');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    const emailIssues = [];

    try {
      await sendContactNotification({ name, email, message });
    } catch (emailError) {
      console.error('Contact notification email failed:', emailError);
      emailIssues.push('admin notification');
    }

    try {
      await sendContactThankYou({ name, email, message });
    } catch (emailError) {
      console.error('Contact thank-you email failed:', emailError);
      emailIssues.push('thank-you email');
    }

    return res.status(201).json({
      message:
        emailIssues.length > 0
          ? 'Message received, but some emails could not be sent.'
          : 'Message received and emails sent successfully.',
      emailIssues,
    });
  } catch (error) {
    console.error('Contact form submission failed:', error);
    return res.status(500).json({ message: 'Failed to send contact message.' });
  }
});

module.exports = router;