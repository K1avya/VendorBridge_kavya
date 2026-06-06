const Joi = require('joi');

const createRFQSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  description: Joi.string().required().min(10).max(5000),
  category: Joi.string().required(),
  expectedDeliveryDate: Joi.date().required().messages({
    'date.base': 'Expected delivery date must be a valid date',
  }),
  deadline: Joi.date().required().min(Joi.ref('expectedDeliveryDate')).messages({
    'date.base': 'Deadline must be a valid date',
    'date.min': 'Deadline must be after or equal to expected delivery date',
  }),
  lineItems: Joi.array()
    .items(
      Joi.object({
        itemName: Joi.string().required().min(3).max(100),
        description: Joi.string().optional().max(500),
        quantity: Joi.number().required().positive().integer(),
        unit: Joi.string().required().min(1).max(20),
      })
    )
    .required()
    .min(1)
    .messages({
      'array.min': 'RFQ must have at least one line item',
    }),
  attachments: Joi.string().optional().uri(),
});

const updateRFQSchema = Joi.object({
  title: Joi.string().optional().min(5).max(200),
  description: Joi.string().optional().min(10).max(5000),
  category: Joi.string().optional(),
  expectedDeliveryDate: Joi.date().optional(),
  deadline: Joi.date().optional().min(Joi.ref('expectedDeliveryDate')).messages({
    'date.min': 'Deadline must be after or equal to expected delivery date',
  }),
  lineItems: Joi.array()
    .items(
      Joi.object({
        itemName: Joi.string().required().min(3).max(100),
        description: Joi.string().optional().max(500),
        quantity: Joi.number().required().positive().integer(),
        unit: Joi.string().required().min(1).max(20),
      })
    )
    .optional()
    .min(1)
    .messages({
      'array.min': 'RFQ must have at least one line item',
    }),
  attachments: Joi.string().optional().uri(),
});

const assignVendorsSchema = Joi.object({
  vendorIds: Joi.array().items(Joi.string()).required().min(1),
});

module.exports = {
  createRFQSchema,
  updateRFQSchema,
  assignVendorsSchema,
};
