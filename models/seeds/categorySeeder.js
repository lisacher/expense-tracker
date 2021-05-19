const Category = require('../category')
const db = require('../../config/mongoose')
const categoryList = require('./category.json')

db.once('open', () => {
  Category.create(...categoryList.results)
    .then(() => {
      console.log('insert category done...')
      return db.close()
    })
    .then(() => {
      console.log('database connection close...')
    })
})