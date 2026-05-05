const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const nominationRoutes = require('./routes/nomination');
const { initializeMailer } = require('./utils/mailer');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL;

app.use(
  cors({
    origin: clientUrl,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/nomination', nominationRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing');
    }

    if (
      !process.env.GMAIL_USER ||
      !process.env.GMAIL_APP_PASSWORD ||
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_LOGIN_EMAIL ||
      !process.env.ADMIN_LOGIN_PASSWORD ||
      !process.env.ADMIN_ACCESS_TOKEN
    ) {
      throw new Error('Admin and email environment variables are missing');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    await initializeMailer();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  }
};

startServer();
