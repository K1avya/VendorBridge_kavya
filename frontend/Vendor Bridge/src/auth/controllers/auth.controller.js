const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../../shared/utils/response');
const { BadRequestError } = require('../../shared/utils/errors');

const register = async (req, res, next) => {
  try {
    const { email, name, password } = req.validatedBody;

    const user = await authService.registerUser(email, name, password);

    sendSuccess(
      res,
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        message: 'Please verify your email to complete registration',
      },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    const user = await authService.loginUser(email, password);

    const token = authService.generateAccessToken(
      user.id,
      user.email,
      user.role,
      user.isEmailVerified
    );

    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new BadRequestError('Google authorization code required');
    }

    const user = await authService.googleLogin(code);

    const token = authService.generateAccessToken(
      user.id,
      user.email,
      user.role,
      user.isEmailVerified
    );

    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
      'Google login successful'
    );
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.validatedBody;

    const user = await authService.verifyEmail(token);

    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
      },
      'Email verified successfully'
    );
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.validatedBody;

    await authService.forgotPassword(email);

    sendSuccess(
      res,
      null,
      'Password reset link sent to your email'
    );
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.validatedBody;

    const user = await authService.resetPassword(token, password);

    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      'Password reset successful'
    );
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.validatedBody;
    const userId = req.user.id;

    await authService.changePassword(userId, oldPassword, newPassword);

    sendSuccess(
      res,
      null,
      'Password changed successfully'
    );
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await authService.getMe(userId);

    sendSuccess(
      res,
      user,
      'User details retrieved'
    );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    sendSuccess(
      res,
      null,
      'Logout successful'
    );
  } catch (error) {
    next(error);
  }
};

const createUserByAdmin = async (req, res, next) => {
  try {
    const { email, name, password, role } = req.validatedBody;
    const adminId = req.user.id;

    // Verify user is admin
    if (req.user.role !== 'ADMIN') {
      throw new BadRequestError('Only ADMIN can create users');
    }

    const user = await authService.createUserByAdmin(email, name, password, role);

    sendSuccess(
      res,
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        message: 'User created successfully. Email verification link sent.',
      },
      'User created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleCallback,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  me,
  logout,
  createUserByAdmin,
};
