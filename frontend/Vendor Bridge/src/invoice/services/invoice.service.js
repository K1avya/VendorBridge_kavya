const prisma = require('../../config/prisma')
const { NotFoundError, BadRequestError } = require('../../shared/utils/errors')
const { logActivity } = require('../../shared/services/activityLog.service')

const createInvoice = async (poId, vendorId, invoiceNumber, amount, dueDate) => {
  // Verify PO exists and belongs to the vendor
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: { vendor: true },
  })

  if (!po) {
    throw new NotFoundError('Purchase Order not found')
  }

  if (po.vendorId !== vendorId) {
    throw new BadRequestError('Vendor can only submit invoices for their own POs')
  }

  // Check if invoice number already exists
  const existingInvoice = await prisma.invoice.findUnique({
    where: { invoiceNumber },
  })

  if (existingInvoice) {
    throw new BadRequestError('Invoice number already exists')
  }

  const invoice = await prisma.invoice.create({
    data: {
      poId,
      vendorId,
      invoiceNumber,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      status: 'SUBMITTED',
    },
    include: {
      po: {
        include: {
          vendor: true,
          quotation: true,
        },
      },
      vendor: true,
    },
  })

  // Log activity
  await logActivity(vendorId, 'CREATED', 'Invoice', invoice.id, {
    invoiceNumber,
    poId,
    amount,
  })

  return invoice
}

const getInvoiceById = async (invoiceId) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      po: {
        include: {
          vendor: true,
          quotation: true,
        },
      },
      vendor: true,
    },
  })

  if (!invoice) {
    throw new NotFoundError('Invoice not found')
  }

  return invoice
}

const listInvoices = async (page = 1, limit = 10, status = null) => {
  const skip = (page - 1) * limit
  const where = status ? { status } : {}

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        po: {
          include: {
            vendor: true,
            quotation: true,
          },
        },
        vendor: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.count({ where }),
  ])

  return {
    data: invoices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

const updateInvoiceStatus = async (invoiceId, status, userId) => {
  const validStatuses = ['SUBMITTED', 'APPROVED', 'PAID', 'REJECTED']

  if (!validStatuses.includes(status)) {
    throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
  }

  const invoice = await getInvoiceById(invoiceId)

  // Business logic: SUBMITTED → APPROVED, PAID, or REJECTED
  if (invoice.status === 'SUBMITTED') {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new BadRequestError('From SUBMITTED, only APPROVED or REJECTED are valid')
    }
  }

  // APPROVED → PAID or REJECTED
  if (invoice.status === 'APPROVED') {
    if (!['PAID', 'REJECTED'].includes(status)) {
      throw new BadRequestError('From APPROVED, only PAID or REJECTED are valid')
    }
  }

  // PAID and REJECTED are terminal states
  if (['PAID', 'REJECTED'].includes(invoice.status)) {
    throw new BadRequestError('Cannot change status of a terminal invoice')
  }

  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status },
    include: {
      po: {
        include: {
          vendor: true,
          quotation: true,
        },
      },
      vendor: true,
    },
  })

  // Log activity
  await logActivity(userId, 'STATUS_CHANGED', 'Invoice', invoiceId, {
    invoiceNumber: invoice.invoiceNumber,
    oldStatus: invoice.status,
    newStatus: status,
  })

  return updated
}

module.exports = {
  createInvoice,
  getInvoiceById,
  listInvoices,
  updateInvoiceStatus,
}
