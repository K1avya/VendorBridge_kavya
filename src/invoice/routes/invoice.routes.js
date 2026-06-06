const express = require('express')
const authenticate = require('../../middleware/authenticate')
const invoiceController = require('../controllers/invoice.controller')

const router = express.Router()

// POST /api/invoices/:poId - Vendor submits invoice
router.post('/:poId', authenticate, invoiceController.createInvoice)

// GET /api/invoices - Admin views all invoices
router.get('/', authenticate, invoiceController.listInvoices)

// GET /api/invoices/:id - Invoice detail
router.get('/:id', authenticate, invoiceController.getInvoiceById)

// PATCH /api/invoices/:id/status - Admin marks invoice PAID/REJECTED
router.patch('/:id/status', authenticate, invoiceController.updateInvoiceStatus)

module.exports = router

