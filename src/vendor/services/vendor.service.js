const prisma = require('../../config/prisma');
const { NotFoundError, BadRequestError, ConflictError } = require('../../shared/utils/errors');

const createVendor = async (userId, vendorData) => {
  const existing = await prisma.vendor.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new ConflictError('Vendor profile already exists for this user');
  }

  const emailExists = await prisma.vendor.findFirst({
    where: { email: vendorData.email },
  });

  if (emailExists) {
    throw new ConflictError('Email already registered as vendor');
  }

  const vendor = await prisma.vendor.create({
    data: {
      userId,
      companyName: vendorData.companyName,
      gstNumber: vendorData.gstNumber,
      panNumber: vendorData.panNumber,
      contactPerson: vendorData.contactPerson,
      email: vendorData.email,
      phone: vendorData.phone,
      address: vendorData.address,
      city: vendorData.city,
      state: vendorData.state,
      country: vendorData.country,
      status: 'APPROVED',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return vendor;
};

const getVendorProfile = async (userId) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });

  if (!vendor) {
    throw new NotFoundError('Vendor profile not found');
  }

  return vendor;
};

const updateVendor = async (vendorId, userId, updateData) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
  });

  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  if (vendor.userId !== userId) {
    throw new BadRequestError('Unauthorized to update this vendor profile');
  }

  if (updateData.email && updateData.email !== vendor.email) {
    const emailExists = await prisma.vendor.findFirst({
      where: {
        email: updateData.email,
        NOT: { id: vendorId },
      },
    });

    if (emailExists) {
      throw new ConflictError('Email already registered as vendor');
    }
  }

  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return updated;
};

const listApprovedVendors = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where: { status: 'APPROVED' },
      skip,
      take: limit,
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        country: true,
        rating: true,
        totalOrders: true,
        createdAt: true,
      },
      orderBy: { rating: 'desc' },
    }),
    prisma.vendor.count({
      where: { status: 'APPROVED' },
    }),
  ]);

  return {
    items: vendors,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const listVendors = async (page = 1, limit = 10, status = null) => {
  const skip = (page - 1) * limit;
  const where = status && status !== 'all' ? { status } : {};

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        companyName: true,
        gstNumber: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        country: true,
        rating: true,
        status: true,
        totalOrders: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vendor.count({ where }),
  ]);

  return {
    items: vendors,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const updateVendorStatus = async (vendorId, status) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
  });

  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: { status },
  });

  return updated;
};

const getVendorById = async (vendorId) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  return vendor;
};

module.exports = {
  createVendor,
  getVendorProfile,
  updateVendor,
  listApprovedVendors,
  listVendors,
  updateVendorStatus,
  getVendorById,
};
