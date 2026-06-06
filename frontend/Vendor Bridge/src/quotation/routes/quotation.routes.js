const express = require('express')
const authenticate = require('../../middleware/authenticate')
const authorize = require('../../middleware/authorize')
const validate = require('../../shared/middleware/validation')
const {
  createQuotationSchema,
  updateQuotationSchema,
  selectQuotationSchema,
} = require('../validators/quotation.validators')
const controller = require('../controllers/quotation.controller')

const router = express.Router()

router.post(
  '/',
  authenticate,
  authorize(['VENDOR']),
  validate(createQuotationSchema),
  controller.createQuotation
)

router.patch(
  '/:quotationId',
  authenticate,
  authorize(['VENDOR']),
  validate(updateQuotationSchema),
  controller.updateQuotation
)

router.get(
  '/vendor/list',
  authenticate,
  authorize(['VENDOR']),
  controller.listVendorQuotations
)

router.get(
  '/rfq/:rfqId',
  authenticate,
  authorize(['PROCUREMENT_OFFICER']),
  controller.listRFQQuotations
)

router.post(
  '/:quotationId/select',
  authenticate,
  authorize(['PROCUREMENT_OFFICER']),
  validate(selectQuotationSchema),
  controller.selectQuotation
)

module.exports = router
