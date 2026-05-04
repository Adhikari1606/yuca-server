const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

if (!gmailUser || !gmailAppPassword) {
  throw new Error('Gmail configuration is missing. Check GMAIL_USER and GMAIL_APP_PASSWORD in server/.env');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailAppPassword,
  },
});

const categoryLabel = {
  'feature-film': 'Feature film',
  'short-film': 'Short film',
  'video-song': 'Video song',
};

const buildNominationHtml = (data) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
    <h2>New YUCA Nomination Received</h2>
    <p><strong>Full Name:</strong> ${data.fullName}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Category:</strong> ${categoryLabel[data.category] || data.category}</p>
    <p><strong>Content Name:</strong> ${data.contentName}</p>
    <p><strong>Content URL:</strong> <a href="${data.contentUrl}">${data.contentUrl}</a></p>
    <p><strong>Release Year:</strong> ${data.releaseYear}</p>
    <p><strong>Address:</strong> ${data.addressLine1}, ${data.city}, ${data.state} - ${data.zipCode}</p>
  </div>
`;

const buildThankYouHtml = (data) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
    <h2>Thank You for Your Submission</h2>
    <p>Dear ${data.fullName},</p>
    <p>Thank you for submitting your work to the YUCA Awards 2026. We have received your nomination successfully.</p>
    <p>Our team will review the details and contact you if needed.</p>
    <p>Best regards,<br/>YUCA Team</p>
  </div>
`;

const buildContactHtml = (data) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
    <h2>New Contact Form Message</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Message:</strong></p>
    <p>${data.message}</p>
  </div>
`;

const buildContactReplyHtml = (data) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
    <h2>Thank You for Reaching Out</h2>
    <p>Dear ${data.name},</p>
    <p>Thank you for contacting YUCA. We have received your message and our team will get back to you soon.</p>
    <p>Best regards,<br/>YUCA Team</p>
  </div>
`;

const sendNominationNotification = async (data) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  await transporter.sendMail({
    from: gmailUser,
    to: adminEmail,
    subject: `New YUCA Nomination: ${data.fullName}`,
    html: buildNominationHtml(data),
  });
};

const sendThankYouEmail = async (data) => {
  await transporter.sendMail({
    from: gmailUser,
    to: data.email,
    subject: 'YUCA Nomination Received',
    html: buildThankYouHtml(data),
  });
};

const sendContactNotification = async (data) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  await transporter.sendMail({
    from: gmailUser,
    to: adminEmail,
    replyTo: data.email,
    subject: `New Contact Message: ${data.name}`,
    html: buildContactHtml(data),
  });
};

const sendContactThankYou = async (data) => {
  await transporter.sendMail({
    from: gmailUser,
    to: data.email,
    subject: 'YUCA Contact Request Received',
    html: buildContactReplyHtml(data),
  });
};

module.exports = {
  sendNominationNotification,
  sendThankYouEmail,
  sendContactNotification,
  sendContactThankYou,
};
