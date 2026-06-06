const Joi = require('joi')

const createQuotationSchema = Joi.object({
  rfqId: Joi.string().uuid().required(),
  unitPrice: Joi.number().positive().required(),
  totalPrice: Joi.number().positive().required(),
  deliveryDays: Joi.number().integer().positive().required(),
  notes: Joi.string().max(1000).allow(''),
})

const updateQuotationSchema = Joi.object({
  unitPrice: Joi.number().positive(),
  totalPrice: Joi.number().positive(),
  deliveryDays: Joi.number().integer().positive(),
  notes: Joi.string().max(1000).allow(''),
}).min(1)

const selectQuotationSchema = Joi.object({
  quotationId: Joi.string().uuid().required(),
})

module.exports = {
  createQuotationSchema,
  updateQuotationSchema,
  selectQuotationSchema,
}
