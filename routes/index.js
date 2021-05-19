const express = require('express')
const home = require('./modules/home')
const records = require('./modules/records')
const router = express.Router()

router.use('/', home)
router.use('/records', records)

module.exports = router