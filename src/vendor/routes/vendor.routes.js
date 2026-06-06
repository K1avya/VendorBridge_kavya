const express = require('express');
const vendorController = require('../controllers/vendor.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../shared/middleware/validation');
const { createVendorSchema, updateVendorSchema } = require('../validators/vendor.validators');

const router = express.Router();

// GET /vendors - list all vendors for admin/manager/officer
router.get(
  '/',
  authenticate,
  authorize(['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER']),
  vendorController.listApprovedVendors
);

router.post(
  '/',
  authenticate,
  authorize(['VENDOR']),
  validate(createVendorSchema),
  vendorController.createVendor
);

router.get(
  '/profile',
  authenticate,
  authorize(['VENDOR']),
  vendorController.getProfile
);

router.put(
  '/:vendorId',
  authenticate,
  authorize(['VENDOR']),
  validate(updateVendorSchema),
  vendorController.updateProfile
);

router.get(
  '/list/approved',
  authenticate,
  vendorController.listApprovedVendors
);

router.patch(
  '/:vendorId/status',
  authenticate,
  authorize(['ADMIN']),
  vendorController.updateVendorStatus
);

module.exports = router;

