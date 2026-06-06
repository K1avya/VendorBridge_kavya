const prisma = require('../../config/prisma');
const { BadRequestError, NotFoundError, UnauthorizedError, ValidationError } = require('../../shared/utils/errors');

const createRFQ = async (createdBy, title, description, category, lineItems, expectedDeliveryDate, deadline, attachments = null) => {
  if (!lineItems || lineItems.length === 0) {
    throw new ValidationError('RFQ must have at least one line item');
  }

  const newRFQ = await prisma.rFQ.create({
    data: {
      title,
      description,
      category,
      expectedDeliveryDate: new Date(expectedDeliveryDate),
      deadline: new Date(deadline),
      attachments,
      createdBy,
      status: 'DRAFT',
      lineItems: {
        create: lineItems.map(item => ({
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
        })),
      },
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      lineItems: true,
      assignedVendors: { select: { vendor: { select: { id: true, companyName: true, email: true } } } },
    },
  });

  return newRFQ;
};

const listRFQs = async (page = 1, limit = 10, filters = {}) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.createdBy) where.createdBy = filters.createdBy;

  const [rfqs, total] = await Promise.all([
    prisma.rFQ.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, email: true, name: true } },
        lineItems: true,
        assignedVendors: {
          select: {
            vendor: { select: { id: true, companyName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.rFQ.count({ where }),
  ]);

  return {
    data: rfqs,
    total,
  };
};

const getRFQDetails = async (rfqId) => {
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: {
      user: { select: { id: true, email: true, name: true } },
      lineItems: true,
      assignedVendors: {
        include: {
          vendor: { select: { id: true, companyName: true, email: true, phone: true, address: true } },
        },
      },
    },
  });

  if (!rfq) {
    throw new NotFoundError('RFQ not found');
  }

  return rfq;
};

const updateRFQ = async (rfqId, createdBy, updateData) => {
  const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId } });

  if (!rfq) {
    throw new NotFoundError('RFQ not found');
  }

  if (rfq.createdBy !== createdBy) {
    throw new UnauthorizedError('You can only edit your own RFQs');
  }

  if (rfq.status !== 'DRAFT') {
    throw new ValidationError('Can only edit RFQs in DRAFT status');
  }

  // Handle line items update
  const lineItemsData = updateData.lineItems
    ? {
        deleteMany: { rfqId },
        create: updateData.lineItems.map(item => ({
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
        })),
      }
    : undefined;

  const updated = await prisma.rFQ.update({
    where: { id: rfqId },
    data: {
      title: updateData.title || rfq.title,
      description: updateData.description || rfq.description,
      category: updateData.category || rfq.category,
      expectedDeliveryDate: updateData.expectedDeliveryDate ? new Date(updateData.expectedDeliveryDate) : rfq.expectedDeliveryDate,
      deadline: updateData.deadline ? new Date(updateData.deadline) : rfq.deadline,
      attachments: updateData.attachments !== undefined ? updateData.attachments : rfq.attachments,
      lineItems: lineItemsData,
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      lineItems: true,
      assignedVendors: { select: { vendor: { select: { id: true, companyName: true, email: true } } } },
    },
  });

  return updated;
};

const publishRFQ = async (rfqId, createdBy) => {
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: { assignedVendors: true, lineItems: true },
  });

  if (!rfq) {
    throw new NotFoundError('RFQ not found');
  }

  if (rfq.createdBy !== createdBy) {
    throw new UnauthorizedError('You can only publish your own RFQs');
  }

  if (rfq.status !== 'DRAFT') {
    throw new ValidationError('Only DRAFT RFQs can be published');
  }

  if (rfq.assignedVendors.length === 0) {
    throw new ValidationError('RFQ must have at least one vendor assigned before publishing');
  }

  if (rfq.lineItems.length === 0) {
    throw new ValidationError('RFQ must have at least one line item before publishing');
  }

  const published = await prisma.rFQ.update({
    where: { id: rfqId },
    data: { status: 'PUBLISHED' },
    include: {
      user: { select: { id: true, email: true, name: true } },
      lineItems: true,
      assignedVendors: { select: { vendor: { select: { id: true, companyName: true, email: true } } } },
    },
  });

  return published;
};

const assignVendorsToRFQ = async (rfqId, createdBy, vendorIds) => {
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: { assignedVendors: true },
  });

  if (!rfq) {
    throw new NotFoundError('RFQ not found');
  }

  if (rfq.createdBy !== createdBy) {
    throw new UnauthorizedError('You can only assign vendors to your own RFQs');
  }

  // Verify all vendors exist
  const vendors = await prisma.vendor.findMany({
    where: { id: { in: vendorIds } },
  });

  if (vendors.length !== vendorIds.length) {
    throw new ValidationError('One or more vendors do not exist');
  }

  // Remove existing assignments
  await prisma.rfqVendor.deleteMany({
    where: { rfqId },
  });

  // Create new assignments
  const assignments = await prisma.rfqVendor.createMany({
    data: vendorIds.map(vendorId => ({
      rfqId,
      vendorId,
    })),
  });

  const updated = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: {
      user: { select: { id: true, email: true, name: true } },
      lineItems: true,
      assignedVendors: {
        include: {
          vendor: { select: { id: true, companyName: true, email: true } },
        },
      },
    },
  });

  return updated;
};

const getVendorAssignedRFQs = async (vendorId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [rfqs, total] = await Promise.all([
    prisma.rfqVendor.findMany({
      where: { vendorId },
      skip,
      take: limit,
      include: {
        rfq: {
          include: {
            user: { select: { id: true, email: true, name: true } },
            lineItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.rfqVendor.count({ where: { vendorId } }),
  ]);

  const data = rfqs.map(item => item.rfq);

  return { data, total };
};

module.exports = {
  createRFQ,
  listRFQs,
  getRFQDetails,
  updateRFQ,
  publishRFQ,
  assignVendorsToRFQ,
  getVendorAssignedRFQs,
};
