const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...\n');

  const now = Date.now();
  const DAY = 86400000;

  // ═══════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════
  console.log('👤 Creating users...');
  
  const hashedPassword = await bcryptjs.hash('Admin@123456', 12);
  const officerPw = await bcryptjs.hash('Officer@123456', 12);
  const managerPw = await bcryptjs.hash('Manager@123456', 12);
  const vendorPw = await bcryptjs.hash('Vendor@123456', 12);

  const admin = await prisma.user.create({
    data: { email: 'admin@vendorbridge.com', name: 'Rajesh Kumar', passwordHash: hashedPassword, role: 'ADMIN', isEmailVerified: true, isActive: true },
  });
  const officer = await prisma.user.create({
    data: { email: 'officer@vendorbridge.com', name: 'Priya Sharma', passwordHash: officerPw, role: 'PROCUREMENT_OFFICER', isEmailVerified: true, isActive: true },
  });
  const manager = await prisma.user.create({
    data: { email: 'manager@vendorbridge.com', name: 'Amit Patel', passwordHash: managerPw, role: 'MANAGER', isEmailVerified: true, isActive: true },
  });
  const v1User = await prisma.user.create({
    data: { email: 'vendor1@example.com', name: 'Suresh Mehta', passwordHash: vendorPw, role: 'VENDOR', isEmailVerified: true, isActive: true },
  });
  const v2User = await prisma.user.create({
    data: { email: 'vendor2@example.com', name: 'Anita Desai', passwordHash: vendorPw, role: 'VENDOR', isEmailVerified: true, isActive: true },
  });
  const v3User = await prisma.user.create({
    data: { email: 'vendor3@example.com', name: 'Vikram Singh', passwordHash: vendorPw, role: 'VENDOR', isEmailVerified: true, isActive: true },
  });
  const v4User = await prisma.user.create({
    data: { email: 'vendor4@example.com', name: 'Neha Gupta', passwordHash: vendorPw, role: 'VENDOR', isEmailVerified: true, isActive: true },
  });
  const v5User = await prisma.user.create({
    data: { email: 'vendor5@example.com', name: 'Ravi Krishnan', passwordHash: vendorPw, role: 'VENDOR', isEmailVerified: true, isActive: true },
  });
  console.log('  ✅ 8 users created');

  // ═══════════════════════════════════════════
  // VENDORS
  // ═══════════════════════════════════════════
  console.log('🏢 Creating vendors...');

  const v1 = await prisma.vendor.create({
    data: { userId: v1User.id, companyName: 'ABC Electronics Ltd', gstNumber: '18AABCT1234H1Z0', panNumber: 'AAACT1234H', contactPerson: 'Suresh Mehta', email: 'contact@abcelectronics.com', phone: '9876543210', address: '123 Industrial Park, Electronic City Phase 2', city: 'Bangalore', state: 'Karnataka', country: 'India', rating: 4.5, totalOrders: 28, status: 'APPROVED' },
  });
  const v2 = await prisma.vendor.create({
    data: { userId: v2User.id, companyName: 'XYZ Supplies Inc', gstNumber: '18AABCS5678H1Z0', panNumber: 'AABCS5678H', contactPerson: 'Anita Desai', email: 'contact@xyzsupplies.com', phone: '9876543211', address: '456 Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', country: 'India', rating: 4.2, totalOrders: 15, status: 'APPROVED' },
  });
  const v3 = await prisma.vendor.create({
    data: { userId: v3User.id, companyName: 'Global Steel Works', gstNumber: '20AABCG9012H1Z0', panNumber: 'AABCG9012H', contactPerson: 'Vikram Singh', email: 'sales@globalsteelworks.com', phone: '9812345678', address: '789 Adityapur Industrial Area', city: 'Jamshedpur', state: 'Jharkhand', country: 'India', rating: 4.7, totalOrders: 42, status: 'APPROVED' },
  });
  const v4 = await prisma.vendor.create({
    data: { userId: v4User.id, companyName: 'TechNova Solutions', gstNumber: '36AABCT3456H1Z0', panNumber: 'AABCT3456H', contactPerson: 'Neha Gupta', email: 'info@technovasolutions.com', phone: '9898765432', address: '101 Cyber Towers, HITEC City', city: 'Hyderabad', state: 'Telangana', country: 'India', rating: 4.3, totalOrders: 19, status: 'APPROVED' },
  });
  const v5 = await prisma.vendor.create({
    data: { userId: v5User.id, companyName: 'Metro Office Supplies', gstNumber: '07AABCM7890H1Z0', panNumber: 'AABCM7890H', contactPerson: 'Ravi Krishnan', email: 'orders@metrooffice.com', phone: '9871234567', address: '55 Connaught Place, Block F', city: 'New Delhi', state: 'Delhi', country: 'India', rating: 3.9, totalOrders: 8, status: 'APPROVED' },
  });
  console.log('  ✅ 5 vendors created');

  // ═══════════════════════════════════════════
  // RFQs (using actual schema: description is required, expectedDeliveryDate is required)
  // ═══════════════════════════════════════════
  console.log('📄 Creating RFQs...');

  const rfq1 = await prisma.rFQ.create({
    data: {
      title: 'Office Laptops Procurement - Q3 2026',
      description: 'Procurement of 50 high-performance laptops for engineering and design teams. Must include 3-year warranty.',
      category: 'Electronics',
      expectedDeliveryDate: new Date(now + 45 * DAY),
      deadline: new Date(now + 14 * DAY),
      createdBy: officer.id,
      status: 'PUBLISHED',
      lineItems: { create: [
        { itemName: 'Dell XPS 15 Laptop (i7, 16GB, 512GB)', description: 'High-performance dev laptop', quantity: 30, unit: 'pcs' },
        { itemName: 'MacBook Pro M3 14"', description: 'Premium laptop for design team', quantity: 15, unit: 'pcs' },
        { itemName: 'Laptop Carry Bags (Premium)', description: 'Professional laptop bags', quantity: 50, unit: 'pcs' },
      ]},
    },
  });

  const rfq2 = await prisma.rFQ.create({
    data: {
      title: 'Annual Stationery Supply Contract',
      description: 'Annual contract for office stationery supplies including paper, pens, notebooks for all 3 office locations.',
      category: 'Office Supplies',
      expectedDeliveryDate: new Date(now + 30 * DAY),
      deadline: new Date(now + 10 * DAY),
      createdBy: officer.id,
      status: 'DRAFT',
      lineItems: { create: [
        { itemName: 'A4 Paper (75 GSM) - 500 sheets/ream', description: 'Premium white copier paper', quantity: 500, unit: 'box' },
        { itemName: 'Ballpoint Pens (Blue/Black)', description: 'Smooth-writing ballpoint pens', quantity: 1000, unit: 'pcs' },
        { itemName: 'Spiral Notebooks (200 pages)', description: 'Ruled notebooks for meetings', quantity: 300, unit: 'pcs' },
      ]},
    },
  });

  const rfq3 = await prisma.rFQ.create({
    data: {
      title: 'Server Room Equipment Upgrade',
      description: 'Complete server room infrastructure upgrade including rack servers, UPS systems, and networking equipment.',
      category: 'IT Equipment',
      expectedDeliveryDate: new Date(now + 60 * DAY),
      deadline: new Date(now + 21 * DAY),
      createdBy: officer.id,
      status: 'PUBLISHED',
      lineItems: { create: [
        { itemName: 'Dell PowerEdge R750 Rack Server', description: '2x Intel Xeon, 128GB RAM, 4x 960GB SSD', quantity: 4, unit: 'pcs' },
        { itemName: 'APC Smart-UPS 10kVA', description: 'Online UPS with extended runtime', quantity: 2, unit: 'pcs' },
        { itemName: 'Cisco Catalyst 9300 Switch (48-port)', description: 'Managed enterprise switch with PoE+', quantity: 3, unit: 'pcs' },
      ]},
    },
  });

  const rfq4 = await prisma.rFQ.create({
    data: {
      title: 'Structural Steel Beams - Warehouse Project',
      description: 'Supply of structural steel I-beams and H-beams for the new warehouse construction project at Pune facility.',
      category: 'Raw Materials',
      expectedDeliveryDate: new Date(now - 10 * DAY),
      deadline: new Date(now - 30 * DAY),
      createdBy: officer.id,
      status: 'CLOSED',
      lineItems: { create: [
        { itemName: 'Steel I-Beam (ISMB 300)', description: 'IS 2062 Grade E250, 12m length', quantity: 50, unit: 'pcs' },
        { itemName: 'Steel H-Beam (ISHB 200)', description: 'IS 2062 Grade E250, 10m length', quantity: 30, unit: 'pcs' },
      ]},
    },
  });

  const rfq5 = await prisma.rFQ.create({
    data: {
      title: 'Executive Office Furniture Upgrade',
      description: 'Ergonomic office furniture for newly renovated 5th floor executive suite and meeting rooms.',
      category: 'Furniture',
      expectedDeliveryDate: new Date(now + 40 * DAY),
      deadline: new Date(now + 12 * DAY),
      createdBy: officer.id,
      status: 'PUBLISHED',
      lineItems: { create: [
        { itemName: 'Herman Miller Aeron Chair', description: 'Fully adjustable ergonomic chair, Size B', quantity: 20, unit: 'pcs' },
        { itemName: 'Standing Desk (Electric, 60x30")', description: 'Height-adjustable sit-stand desk', quantity: 20, unit: 'pcs' },
        { itemName: 'Conference Table (12-seater)', description: 'Oval boardroom table, walnut finish', quantity: 3, unit: 'pcs' },
      ]},
    },
  });

  const rfq6 = await prisma.rFQ.create({
    data: {
      title: 'Cloud Infrastructure Services - FY 2026-27',
      description: 'Annual cloud infrastructure and managed services contract covering compute, storage, and DevOps support.',
      category: 'Services',
      expectedDeliveryDate: new Date(now + 90 * DAY),
      deadline: new Date(now + 20 * DAY),
      createdBy: officer.id,
      status: 'DRAFT',
      lineItems: { create: [
        { itemName: 'Cloud Compute Instances (monthly)', description: 'Reserved instances, 8 vCPU / 32GB RAM', quantity: 10, unit: 'set' },
        { itemName: 'Managed Database Service', description: 'PostgreSQL RDS, Multi-AZ, 500GB', quantity: 3, unit: 'set' },
      ]},
    },
  });

  console.log('  ✅ 6 RFQs created');

  // ═══════════════════════════════════════════
  // ASSIGN VENDORS TO RFQs
  // ═══════════════════════════════════════════
  console.log('🔗 Assigning vendors to RFQs...');

  await prisma.rfqVendor.createMany({ data: [
    { rfqId: rfq1.id, vendorId: v1.id },
    { rfqId: rfq1.id, vendorId: v4.id },
  ]});
  await prisma.rfqVendor.createMany({ data: [
    { rfqId: rfq3.id, vendorId: v1.id },
    { rfqId: rfq3.id, vendorId: v4.id },
    { rfqId: rfq3.id, vendorId: v2.id },
  ]});
  await prisma.rfqVendor.createMany({ data: [
    { rfqId: rfq4.id, vendorId: v3.id },
  ]});
  await prisma.rfqVendor.createMany({ data: [
    { rfqId: rfq5.id, vendorId: v2.id },
    { rfqId: rfq5.id, vendorId: v5.id },
  ]});
  console.log('  ✅ Vendors assigned to 4 RFQs');

  // ═══════════════════════════════════════════
  // QUOTATIONS (actual schema: basePrice, tax, discount, finalAmount, deliveryDays, remarks)
  // ═══════════════════════════════════════════
  console.log('💰 Creating quotations...');

  // Quotation 1: ABC Electronics for Laptops
  const q1 = await prisma.quotation.create({
    data: {
      rfqId: rfq1.id, vendorId: v1.id,
      basePrice: 3800000, tax: 684000, discount: 190000, finalAmount: 4294000,
      deliveryDays: 21, remarks: 'Bulk discount 5%. Free on-site installation. 3-year comprehensive warranty.',
      status: 'SUBMITTED',
    },
  });

  // Quotation 2: TechNova for Laptops
  const q2 = await prisma.quotation.create({
    data: {
      rfqId: rfq1.id, vendorId: v4.id,
      basePrice: 3650000, tax: 657000, discount: 182500, finalAmount: 4124500,
      deliveryDays: 25, remarks: 'Competitive pricing with 4-year extended warranty option. Includes setup and data migration.',
      status: 'SUBMITTED',
    },
  });

  // Quotation 3: ABC Electronics for Server Room
  const q3 = await prisma.quotation.create({
    data: {
      rfqId: rfq3.id, vendorId: v1.id,
      basePrice: 3200000, tax: 576000, discount: 160000, finalAmount: 3616000,
      deliveryDays: 30, remarks: 'Dell authorized partner. Includes rack assembly and 1-year on-site support.',
      status: 'SELECTED',
    },
  });

  // Quotation 4: TechNova for Server Room
  const q4 = await prisma.quotation.create({
    data: {
      rfqId: rfq3.id, vendorId: v4.id,
      basePrice: 3450000, tax: 621000, discount: 0, finalAmount: 4071000,
      deliveryDays: 35, remarks: 'HPE alternative servers. Premium networking gear included.',
      status: 'REJECTED',
    },
  });

  // Quotation 5: XYZ Supplies for Server Room
  const q5 = await prisma.quotation.create({
    data: {
      rfqId: rfq3.id, vendorId: v2.id,
      basePrice: 2900000, tax: 522000, discount: 145000, finalAmount: 3277000,
      deliveryDays: 40, remarks: 'Lenovo servers with competitive pricing. Budget-friendly option.',
      status: 'REJECTED',
    },
  });

  // Quotation 6: Global Steel for Steel Beams
  const q6 = await prisma.quotation.create({
    data: {
      rfqId: rfq4.id, vendorId: v3.id,
      basePrice: 2400000, tax: 432000, discount: 120000, finalAmount: 2712000,
      deliveryDays: 15, remarks: 'Ex-factory Jamshedpur. Transportation included to Pune. Material test certificates provided.',
      status: 'SELECTED',
    },
  });

  // Quotation 7: XYZ Supplies for Furniture
  const q7 = await prisma.quotation.create({
    data: {
      rfqId: rfq5.id, vendorId: v2.id,
      basePrice: 1520000, tax: 273600, discount: 76000, finalAmount: 1717600,
      deliveryDays: 18, remarks: 'All genuine branded products. Installation and assembly included.',
      status: 'SUBMITTED',
    },
  });

  // Quotation 8: Metro Office for Furniture
  const q8 = await prisma.quotation.create({
    data: {
      rfqId: rfq5.id, vendorId: v5.id,
      basePrice: 1350000, tax: 243000, discount: 67500, finalAmount: 1525500,
      deliveryDays: 22, remarks: 'Budget-friendly alternatives with good quality. Free delivery within Delhi NCR.',
      status: 'SUBMITTED',
    },
  });

  console.log('  ✅ 8 quotations created');

  // ═══════════════════════════════════════════
  // APPROVALS (actual schema: quotationId, createdBy, approvedBy, status, remarks)
  // ═══════════════════════════════════════════
  console.log('✅ Creating approvals...');

  const appr1 = await prisma.approval.create({
    data: {
      quotationId: q3.id, createdBy: officer.id, approvedBy: manager.id,
      status: 'APPROVED', remarks: 'Approved. ABC Electronics selected for Server Room - best support terms.',
      approvedAt: new Date(now - 6 * DAY),
    },
  });

  const appr2 = await prisma.approval.create({
    data: {
      quotationId: q6.id, createdBy: officer.id, approvedBy: manager.id,
      status: 'APPROVED', remarks: 'Approved. Global Steel Works - best price and delivery timeline.',
      approvedAt: new Date(now - 18 * DAY),
    },
  });

  await prisma.approval.create({
    data: {
      quotationId: q7.id, createdBy: officer.id,
      status: 'PENDING', remarks: null,
    },
  });

  await prisma.approval.create({
    data: {
      quotationId: q1.id, createdBy: officer.id,
      status: 'PENDING', remarks: null,
    },
  });

  console.log('  ✅ 4 approvals created');

  // ═══════════════════════════════════════════
  // PURCHASE ORDERS (actual schema: poNumber, quotationId, vendorId, rfqId, approvalId, quantity, unitPrice, subtotal, cgst, sgst, cgstAmount, sgstAmount, totalAmount, deliveryDate, status, createdBy)
  // ═══════════════════════════════════════════
  console.log('📦 Creating purchase orders...');

  await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-001',
      quotationId: q3.id, vendorId: v1.id, rfqId: rfq3.id, approvalId: appr1.id,
      quantity: 9, unitPrice: 3200000,
      subtotal: 3616000, cgst: 9, sgst: 9,
      cgstAmount: 325440, sgstAmount: 325440, totalAmount: 4266880,
      deliveryDate: new Date(now + 30 * DAY),
      status: 'ISSUED', createdBy: officer.id,
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-002',
      quotationId: q6.id, vendorId: v3.id, rfqId: rfq4.id, approvalId: appr2.id,
      quantity: 80, unitPrice: 2400000,
      subtotal: 2712000, cgst: 9, sgst: 9,
      cgstAmount: 244080, sgstAmount: 244080, totalAmount: 3200160,
      deliveryDate: new Date(now - 5 * DAY),
      status: 'DELIVERED', createdBy: officer.id,
    },
  });

  console.log('  ✅ 2 purchase orders created');

  // ═══════════════════════════════════════════
  // ACTIVITY LOG (actual schema: userId, action, entity, entityId, changes, description, ipAddress)
  // ═══════════════════════════════════════════
  console.log('📊 Creating activity logs...');

  const activities = [
    { userId: officer.id, action: 'CREATED', entity: 'RFQ', entityId: rfq1.id, description: 'Created RFQ: Office Laptops Procurement - Q3 2026', daysAgo: 28 },
    { userId: officer.id, action: 'CREATED', entity: 'RFQ', entityId: rfq4.id, description: 'Created RFQ: Structural Steel Beams - Warehouse Project', daysAgo: 25 },
    { userId: officer.id, action: 'PUBLISHED', entity: 'RFQ', entityId: rfq1.id, description: 'Published RFQ: Office Laptops Procurement', daysAgo: 24 },
    { userId: v1User.id, action: 'SUBMITTED', entity: 'Quotation', entityId: q1.id, description: 'ABC Electronics submitted quotation for Laptops RFQ (₹42.94L)', daysAgo: 22 },
    { userId: v4User.id, action: 'SUBMITTED', entity: 'Quotation', entityId: q2.id, description: 'TechNova Solutions submitted quotation for Laptops RFQ (₹41.24L)', daysAgo: 21 },
    { userId: v3User.id, action: 'SUBMITTED', entity: 'Quotation', entityId: q6.id, description: 'Global Steel Works submitted quotation for Steel RFQ (₹27.12L)', daysAgo: 20 },
    { userId: manager.id, action: 'APPROVED', entity: 'Approval', entityId: appr2.id, description: 'Approved quotation from Global Steel Works for Steel RFQ', daysAgo: 18 },
    { userId: officer.id, action: 'CREATED', entity: 'PurchaseOrder', entityId: 'po-002', description: 'Created PO-002 for Steel Beams (Global Steel Works - ₹32.00L)', daysAgo: 17 },
    { userId: officer.id, action: 'CREATED', entity: 'RFQ', entityId: rfq3.id, description: 'Created RFQ: Server Room Equipment Upgrade', daysAgo: 15 },
    { userId: officer.id, action: 'PUBLISHED', entity: 'RFQ', entityId: rfq3.id, description: 'Published RFQ: Server Room Equipment Upgrade', daysAgo: 14 },
    { userId: officer.id, action: 'CREATED', entity: 'RFQ', entityId: rfq5.id, description: 'Created RFQ: Executive Office Furniture Upgrade', daysAgo: 12 },
    { userId: v1User.id, action: 'SUBMITTED', entity: 'Quotation', entityId: q3.id, description: 'ABC Electronics submitted quotation for Server Room (₹36.16L)', daysAgo: 10 },
    { userId: v4User.id, action: 'SUBMITTED', entity: 'Quotation', entityId: q4.id, description: 'TechNova submitted quotation for Server Room (₹40.71L)', daysAgo: 9 },
    { userId: v2User.id, action: 'SUBMITTED', entity: 'Quotation', entityId: q5.id, description: 'XYZ Supplies submitted quotation for Server Room (₹32.77L)', daysAgo: 8 },
    { userId: manager.id, action: 'APPROVED', entity: 'Approval', entityId: appr1.id, description: 'Approved ABC Electronics quotation for Server Room upgrade', daysAgo: 6 },
    { userId: officer.id, action: 'CREATED', entity: 'PurchaseOrder', entityId: 'po-001', description: 'Created PO-001 for Server Equipment (ABC Electronics - ₹42.67L)', daysAgo: 5 },
    { userId: v3User.id, action: 'STATUS_CHANGED', entity: 'PurchaseOrder', entityId: 'po-002', description: 'Global Steel Works delivered Steel Beams to Pune warehouse', daysAgo: 3 },
    { userId: v2User.id, action: 'SUBMITTED', entity: 'Quotation', entityId: q7.id, description: 'XYZ Supplies submitted quotation for Furniture RFQ (₹17.18L)', daysAgo: 2 },
    { userId: v5User.id, action: 'SUBMITTED', entity: 'Quotation', entityId: q8.id, description: 'Metro Office submitted quotation for Furniture RFQ (₹15.26L)', daysAgo: 1 },
    { userId: admin.id, action: 'SYSTEM', entity: 'System', entityId: 'system', description: 'System maintenance completed - database backup successful', daysAgo: 0 },
  ];

  for (const act of activities) {
    await prisma.activityLog.create({
      data: {
        userId: act.userId,
        action: act.action,
        entity: act.entity,
        entityId: act.entityId,
        description: act.description,
        createdAt: new Date(now - act.daysAgo * DAY),
      },
    });
  }

  console.log('  ✅ 20 activity entries created');

  console.log('\n🎉 Database seed completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Users:            8');
  console.log('  Vendors:          5');
  console.log('  RFQs:             6');
  console.log('  Quotations:       8');
  console.log('  Approvals:        4');
  console.log('  Purchase Orders:  2');
  console.log('  Activity Logs:    20');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
