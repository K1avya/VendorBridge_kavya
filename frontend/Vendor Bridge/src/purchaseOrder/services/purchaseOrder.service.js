const prisma = require('../../config/prisma')
const { NotFoundError, BadRequestError } = require('../../shared/utils/errors')
const { logActivity } = require('../../shared/services/activityLog.service')

const generatePONumber = async () => {
  const lastPO = await prisma.purchaseOrder.findFirst({
    orderBy: { createdAt: 'desc' },
  })

  if (!lastPO) {
    return 'PO-001'
  }

  const lastNumber = parseInt(lastPO.poNumber.split('-')[1]) || 0
  return `PO-${String(lastNumber + 1).padStart(3, '0')}`
}

const createPurchaseOrder = async (quotationId, approverId, cgstPercentage = 9, sgstPercentage = 9) => {
  const approval = await prisma.approval.findUnique({
    where: { quotationId },
    include: {
      quotation: {
        include: {
          rfq: {
            include: {
              lineItems: true,
            },
          },
          vendor: true,
        },
      },
    },
  })

  if (!approval) {
    throw new NotFoundError('Approval not found for this quotation')
  }

  if (approval.status !== 'APPROVED') {
    throw new BadRequestError('Approval must be approved before creating PO')
  }

  const quotation = approval.quotation
  const poNumber = await generatePONumber()

  // Calculate total quantity from line items
  const totalQuantity = quotation.rfq.lineItems.reduce((sum, item) => sum + item.quantity, 0)

  // Calculate subtotal and taxes
  const subtotal = quotation.finalAmount || quotation.basePrice * totalQuantity
  const cgstAmount = (subtotal * cgstPercentage) / 100
  const sgstAmount = (subtotal * sgstPercentage) / 100
  const totalAmount = subtotal + cgstAmount + sgstAmount

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      quotationId: quotation.id,
      vendorId: quotation.vendorId,
      rfqId: quotation.rfqId,
      approvalId: approval.id,
      quantity: totalQuantity,
      unitPrice: quotation.basePrice,
      tax: quotation.tax,
      discount: quotation.discount,
      cgst: cgstPercentage,
      sgst: sgstPercentage,
      cgstAmount: cgstAmount,
      sgstAmount: sgstAmount,
      totalAmount: totalAmount,
      deliveryDate: quotation.rfq.expectedDeliveryDate,
      status: 'GENERATED',
      createdBy: approverId,
    },
    include: {
      quotation: {
        include: {
          rfq: true,
          vendor: true,
        },
      },
      vendor: true,
      rfq: true,
      createdByUser: true,
    },
  })

  // Log activity
  await logActivity(approverId, 'CREATED', 'PurchaseOrder', po.id, {
    poNumber: po.poNumber,
    vendorId: quotation.vendorId,
    amount: totalAmount,
  })

  return po
}

const getPurchaseOrderById = async (poId) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: {
      quotation: {
        include: {
          rfq: true,
          vendor: true,
        },
      },
      vendor: true,
      rfq: true,
      approval: true,
      createdByUser: true,
    },
  })

  if (!po) {
    throw new NotFoundError('Purchase Order not found')
  }

  return po
}

const listPurchaseOrders = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit

  const [pos, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      include: {
        quotation: {
          include: {
            rfq: true,
            vendor: true,
          },
        },
        vendor: true,
        rfq: true,
        createdByUser: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.purchaseOrder.count(),
  ])

  return {
    data: pos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

const updatePOStatus = async (poId, status, userId) => {
  const validStatuses = ['GENERATED', 'ISSUED', 'DELIVERED']

  if (!validStatuses.includes(status)) {
    throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
  }

  const po = await getPurchaseOrderById(poId)

  const updated = await prisma.purchaseOrder.update({
    where: { id: poId },
    data: { status },
    include: {
      quotation: {
        include: {
          rfq: true,
          vendor: true,
        },
      },
      vendor: true,
      rfq: true,
      approval: true,
      createdByUser: true,
    },
  })

  // Log activity
  await logActivity(userId, 'STATUS_CHANGED', 'PurchaseOrder', poId, {
    poNumber: po.poNumber,
    oldStatus: po.status,
    newStatus: status,
  })

  return updated
}

module.exports = {
  createPurchaseOrder,
  getPurchaseOrderById,
  listPurchaseOrders,
  updatePOStatus,
  generatePONumber,
}
