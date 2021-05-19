const Record = require('../record')
const db = require('../../config/mongoose')
const recordList = require('./record.json')

db.once('open', () => {
  Record.create(...recordList.results)
    .then(() => {
      console.log('insert record done...')
      return db.close()
    })
    .then(() => {
      console.log('database connection close...')
    })
})