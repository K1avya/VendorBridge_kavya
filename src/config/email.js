const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

const emailTemplates = {
  verifyEmail: (token, userName) => {
    const verifyUrl = `${process.env.FRONTEND_VERIFY_URL}?token=${token}`;
    return `
      <h2>Email Verification</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for registering with VendorBridge. Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>Link expires in 24 hours.</p>
      <p>If you didn't create this account, please ignore this email.</p>
    `;
  },

  resetPassword: (token, userName) => {
    const resetUrl = `${process.env.FRONTEND_RESET_URL}?token=${token}`;
    return `
      <h2>Password Reset</h2>
      <p>Hi ${userName},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>Link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
  },

  rfqInvitation: (rfqTitle, vendorName) => {
    return `
      <h2>New RFQ Invitation</h2>
      <p>Hi ${vendorName},</p>
      <p>You have been invited to submit a quotation for:</p>
      <p><strong>${rfqTitle}</strong></p>
      <p>Please login to VendorBridge to view details and submit your quotation.</p>
      <p>Log in: ${process.env.FRONTEND_URL}</p>
    `;
  },

  quotationReceived: (vendorName, rfqTitle) => {
    return `
      <h2>Quotation Received</h2>
      <p>Hi ${vendorName},</p>
      <p>Your quotation for "${rfqTitle}" has been received successfully.</p>
      <p>You will be notified once a decision is made.</p>
    `;
  },

  approvalNotification: (managerName, rfqTitle) => {
    return `
      <h2>Approval Required</h2>
      <p>Hi ${managerName},</p>
      <p>A quotation for "${rfqTitle}" is pending your approval.</p>
      <p>Please login to VendorBridge to review and approve.</p>
      <p>Log in: ${process.env.FRONTEND_URL}</p>
    `;
  },

  poGenerated: (vendorEmail, poNumber, companyName) => {
    return `
      <h2>Purchase Order Generated</h2>
      <p>Hi ${companyName},</p>
      <p>A purchase order has been generated for your approved quotation.</p>
      <p><strong>PO Number: ${poNumber}</strong></p>
      <p>Please log in to VendorBridge for complete details.</p>
    `;
  },
};

module.exports = {
  sendEmail,
  emailTemplates,
};
