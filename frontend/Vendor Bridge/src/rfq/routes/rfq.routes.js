const express = require('express');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../shared/middleware/validation');
const {
  createRFQSchema,
  updateRFQSchema,
  assignVendorsSchema,
} = require('../validators/rfq.validators');
const controller = require('../controllers/rfq.controller');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize(['PROCUREMENT_OFFICER']),
  validate(createRFQSchema),
  controller.createRFQ
);

router.get(
  '/',
  authenticate,
  authorize(['PROCUREMENT_OFFICER', 'VENDOR']),
  controller.listRFQs
);

router.get(
  '/:rfqId',
  authenticate,
  authorize(['PROCUREMENT_OFFICER', 'VENDOR']),
  controller.getRFQDetails
);

router.patch(
  '/:rfqId',
  authenticate,
  authorize(['PROCUREMENT_OFFICER']),
  validate(updateRFQSchema),
  controller.updateRFQ
);

router.post(
  '/:rfqId/publish',
  authenticate,
  authorize(['PROCUREMENT_OFFICER']),
  controller.publishRFQ
);

router.post(
  '/:rfqId/assign-vendors',
  authenticate,
  authorize(['PROCUREMENT_OFFICER']),
  validate(assignVendorsSchema),
  controller.assignVendorsToRFQ
);

router.get(
  '/vendor/assigned',
  authenticate,
  authorize(['VENDOR']),
  controller.getVendorAssignedRFQs
);

module.exports = router;
