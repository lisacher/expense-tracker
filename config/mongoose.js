const mongoose = require('mongoose')
const db = mongoose.connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/record-list'

/* Database connection and statement */
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

db.on('error', () => {
  console.log('mongodb error!')
})

db.once('open', () => {
  console.log('mongodb connected!')
})

module.exports = db