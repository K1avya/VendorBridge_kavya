const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const axios = require('axios');
const crypto = require('crypto');
const prisma = require('../../config/prisma');
const { sendEmail, emailTemplates } = require('../../config/email');
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} = require('../../shared/utils/errors');

const generateAccessToken = (userId, email, role, isEmailVerified) => {
  return jwt.sign(
    {
      id: userId,
      email,
      role,
      isEmailVerified,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '24h' }
  );
};

const hashPassword = async (password) => {
  return bcryptjs.hash(password, 12);
};

const comparePassword = async (password, hash) => {
  return bcryptjs.compare(password, hash);
};

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const exchangeGoogleCode = async (code) => {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const idToken = response.data.id_token;
    const decoded = jwt.decode(idToken);

    return {
      googleId: decoded.sub,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (error) {
    throw new UnauthorizedError('Invalid Google authorization code');
  }
};

const registerUser = async (email, name, password, role = 'VENDOR') => {
  // For public self-registration, only allow VENDOR role
  if (role !== 'VENDOR') {
    throw new BadRequestError('Self-registration is only available for VENDOR role');
  }

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new ConflictError('Email already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(password);
  const verifyToken = generateVerificationToken();

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: 'VENDOR',
      emailVerifyToken: verifyToken,
      emailVerifyExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // Send verification email
  const html = emailTemplates.verifyEmail(verifyToken, name);
  await sendEmail(email, 'Verify your VendorBridge email', html);

  return user;
};

const loginUser = async (email, password) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.passwordHash) {
    throw new BadRequestError('Please login using Google OAuth');
  }

  // Compare password
  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account is inactive');
  }

  return user;
};

const googleLogin = async (code) => {
  const googleData = await exchangeGoogleCode(code);

  // Find or create user
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId: googleData.googleId }, { email: googleData.email }],
    },
  });

  if (!user) {
    // Create new user via Google OAuth
    user = await prisma.user.create({
      data: {
        email: googleData.email,
        name: googleData.name,
        googleId: googleData.googleId,
        role: 'VENDOR',
        isEmailVerified: true,
      },
    });
  } else {
    // Update existing user with Google ID if not already set
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleData.googleId },
      });
    }
  }

  return user;
};

const verifyEmail = async (token) => {
  // Find user with token
  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: token,
    },
  });

  if (!user) {
    throw new NotFoundError('Invalid verification token');
  }

  if (new Date() > user.emailVerifyExpiry) {
    throw new BadRequestError('Verification token expired');
  }

  // Update user
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpiry: null,
    },
  });

  return updated;
};

const forgotPassword = async (email) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Generate reset token
  const resetToken = generateVerificationToken();

  // Update user with token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  // Send email
  const html = emailTemplates.resetPassword(resetToken, user.name);
  await sendEmail(email, 'Reset your VendorBridge password', html);

  return true;
};

const resetPassword = async (token, newPassword) => {
  // Find user with token
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
    },
  });

  if (!user) {
    throw new NotFoundError('Invalid reset token');
  }

  if (new Date() > user.resetTokenExpiry) {
    throw new BadRequestError('Reset token expired');
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update user
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return updated;
};

const changePassword = async (userId, oldPassword, newPassword) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // If user registered via Google, they don't have a password
  if (!user.passwordHash) {
    throw new BadRequestError('Cannot change password for OAuth-registered account');
  }

  // Compare old password
  const isMatch = await comparePassword(oldPassword, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Old password is incorrect');
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update user
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return updated;
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isEmailVerified: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

const createUserByAdmin = async (email, name, password, role) => {
  // Validate role
  const validRoles = ['ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER', 'VENDOR'];
  if (!validRoles.includes(role)) {
    throw new BadRequestError(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new ConflictError('Email already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(password);
  const verifyToken = generateVerificationToken();

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role,
      emailVerifyToken: verifyToken,
      emailVerifyExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // Send verification email
  const html = emailTemplates.verifyEmail(verifyToken, name);
  await sendEmail(email, 'Verify your VendorBridge email', html);

  return user;
};

module.exports = {
  generateAccessToken,
  hashPassword,
  comparePassword,
  generateVerificationToken,
  exchangeGoogleCode,
  registerUser,
  loginUser,
  googleLogin,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  createUserByAdmin,
};
