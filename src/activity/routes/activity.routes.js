const express = require('express')
const authenticate = require('../../middleware/authenticate')
const authorize = require('../../middleware/authorize')
const controller = require('../controllers/activity.controller')

const router = express.Router()

// GET /activity - all logs for ADMIN (base route used by frontend)
router.get(
  '/',
  authenticate,
  authorize(['ADMIN']),
  controller.getAllActivity
)

router.get(
  '/user/:userId',
  authenticate,
  controller.getUserActivity
)

router.get(
  '/entity/:entity/:entityId',
  authenticate,
  authorize(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN']),
  controller.getEntityActivity
)

router.get(
  '/all/logs',
  authenticate,
  authorize(['ADMIN']),
  controller.getAllActivity
)

module.exports = router
