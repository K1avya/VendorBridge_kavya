const prisma = require('../../config/prisma')
const { AppError } = require('../../shared/utils/errors')

const createQuotation = async (rfqId, vendorId, basePrice, tax, discount, finalAmount, deliveryDays, remarks) => {
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
  })

  if (!rfq) {
    throw new AppError('RFQ not found', 404)
  }

  if (rfq.status !== 'PUBLISHED') {
    throw new AppError('RFQ is not published', 400)
  }

  const rfqVendor = await prisma.rfqVendor.findUnique({
    where: {
      rfqId_vendorId: {
        rfqId,
        vendorId,
      },
    },
  })

  if (!rfqVendor) {
    throw new AppError('Vendor not assigned to this RFQ', 400)
  }

  const existing = await prisma.quotation.findFirst({
    where: {
      rfqId,
      vendorId,
    },
  })

  if (existing) {
    throw new AppError('Quotation already submitted for this RFQ', 400)
  }

  const quotation = await prisma.quotation.create({
    data: {
      rfqId,
      vendorId,
      basePrice,
      tax,
      discount,
      finalAmount,
      deliveryDays,
      remarks,
      status: 'SUBMITTED',
    },
    include: {
      rfq: true,
      vendor: true,
    },
  })

  return quotation
}

const updateQuotation = async (quotationId, vendorId, updateData) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { rfq: true },
  })

  if (!quotation) {
    throw new AppError('Quotation not found', 404)
  }

  if (quotation.vendorId !== vendorId) {
    throw new AppError('Unauthorized', 403)
  }

  if (quotation.rfq.status !== 'PUBLISHED') {
    throw new AppError('Cannot update quotation for closed RFQ', 400)
  }

  if (quotation.status !== 'SUBMITTED') {
    throw new AppError('Cannot update rejected or selected quotation', 400)
  }

  const updated = await prisma.quotation.update({
    where: { id: quotationId },
    data: updateData,
    include: {
      rfq: true,
      vendor: true,
    },
  })

  return updated
}

const getQuotation = async (quotationId) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: {
      rfq: true,
      vendor: true,
    },
  })

  if (!quotation) {
    throw new AppError('Quotation not found', 404)
  }

  return quotation
}

const listVendorQuotations = async (vendorId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit

  const [quotations, total] = await Promise.all([
    prisma.quotation.findMany({
      where: { vendorId },
      include: {
        rfq: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quotation.count({ where: { vendorId } }),
  ])

  return {
    data: quotations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

const listRFQQuotations = async (rfqId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit

  const [quotations, total] = await Promise.all([
    prisma.quotation.findMany({
      where: { rfqId },
      include: {
        vendor: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.quotation.count({ where: { rfqId } }),
  ])

  return {
    data: quotations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

const listAllQuotations = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit

  const [quotations, total] = await Promise.all([
    prisma.quotation.findMany({
      include: {
        rfq: true,
        vendor: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quotation.count(),
  ])

  return {
    data: quotations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

const selectQuotation = async (quotationId, officerId) => {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { rfq: true },
  })

  if (!quotation) {
    throw new AppError('Quotation not found', 404)
  }

  if (quotation.rfq.status !== 'PUBLISHED') {
    throw new AppError('RFQ is closed', 400)
  }

  await prisma.quotation.updateMany({
    where: {
      rfqId: quotation.rfqId,
      id: { not: quotationId },
    },
    data: { status: 'REJECTED' },
  })

  const selected = await prisma.quotation.update({
    where: { id: quotationId },
    data: { status: 'SELECTED' },
    include: {
      rfq: true,
      vendor: true,
    },
  })

  return selected
}

module.exports = {
  createQuotation,
  updateQuotation,
  getQuotation,
  listVendorQuotations,
  listRFQQuotations,
  listAllQuotations,
  selectQuotation,
}
