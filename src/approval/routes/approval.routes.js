const express = require('express')
const authenticate = require('../../middleware/authenticate')
const authorize = require('../../middleware/authorize')
const controller = require('../controllers/approval.controller')

const router = express.Router()

// GET /approvals?status=PENDING (base list route for frontend)
router.get(
  '/',
  authenticate,
  authorize(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN']),
  controller.getPendingApprovals
)

router.get(
  '/pending',
  authenticate,
  authorize(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN']),
  controller.getPendingApprovals
)

router.get(
  '/:approvalId',
  authenticate,
  authorize(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN']),
  controller.getApprovalDetails
)

router.post(
  '/:approvalId/approve',
  authenticate,
  authorize(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN']),
  controller.approveQuotation
)

router.post(
  '/:approvalId/reject',
  authenticate,
  authorize(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN']),
  controller.rejectQuotation
)

module.exports = router
