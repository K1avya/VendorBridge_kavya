const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../../shared/middleware/validation');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  createUserByAdminSchema,
} = require('../validators/auth.validators');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/google/callback', authController.googleCallback);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/admin/users', authenticate, authorize(['ADMIN']), validate(createUserByAdminSchema), authController.createUserByAdmin);
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
