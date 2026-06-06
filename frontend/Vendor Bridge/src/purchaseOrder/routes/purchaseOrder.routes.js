const express = require('express')
const authenticate = require('../../middleware/authenticate')
const authorize = require('../../middleware/authorize')
const controller = require('../controllers/purchaseOrder.controller')

const router = express.Router()

router.post(
  '/',
  authenticate,
  authorize(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN']),
  controller.createPurchaseOrder
)

router.get(
  '/',
  authenticate,
  authorize(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  controller.listPurchaseOrders
)

router.get(
  '/:poId',
  authenticate,
  authorize(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN', 'VENDOR']),
  controller.getPurchaseOrderDetails
)

router.patch(
  '/:poId/status',
  authenticate,
  authorize(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN']),
  controller.updatePOStatus
)

module.exports = router
