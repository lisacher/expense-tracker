const express = require('express')
const { body, validationResult } = require('express-validator/check')
const Record = require('../../models/record')
const router = express.Router()

/* Route setting */
// filter
router.get('/filter', (req, res) => {
  const { category } = req.query
  const selectedMonth = req.query.month

  if (!selectedMonth) {
    // filter by category
    const record = Record.aggregate([
      { $match: { category: category } },
      { $lookup: { from: 'categories', localField: 'category', foreignField: 'name', as: 'categoryIcon' } },
      { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$categoryIcon', 0] }, '$$ROOT'] } } },
      { $project: { categoryIcon: 0 } },
      { $sort: { date: -1 } },
      { $addFields: { date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } } }
    ])

    const amount = Record.aggregate([
      { $match: { category: category } },
      { $group: { _id: null, amount: { $sum: '$amount' } } }
    ])

    Promise.all([record, amount, category])
      .then(([record, amount, category]) => {
        const totalAmount = amount[0]
        record.length !== 0 ? res.render('index', { totalAmount, record, category }) : res.redirect('/')
      })
      .catch(error => console.error(error))
  } else {
    // TODO: filter by month
    const year = Number(selectedMonth.slice(0, 4))
    const month = Number(selectedMonth.slice(5, 7))

    // render month selector
    const months = Record.find()
      .sort({ date: -1 })
      .then(records => {
        const months = []
        records.forEach(record => {
          const displayDate = record.date.toISOString().substring(0, 7)

          if (months.includes(displayDate)) {
            return
          }
          months.push(displayDate)
        })
        return months
      })

    // record: filter by month
    const record = Record.aggregate([
      {
        $project: {
          name: 1,
          category: 1,
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          month: { $month: '$date' },
          year: { $year: '$date' },
          amount: 1
        }
      },
      { $match: { month: month, year: year } },
      { $lookup: { from: 'categories', localField: 'category', foreignField: 'name', as: 'categoryIcon' } },
      { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$categoryIcon', 0] }, '$$ROOT'] } } },
      { $project: { categoryIcon: 0 } },
      { $sort: { date: -1 } }
    ])

    // amount: filter by month
    const amount = Record.aggregate([
      { $project: { month: { $month: '$date' }, year: { $year: '$date' }, amount: 1 } },
      { $match: { month: month, year: year } },
      { $group: { _id: null, amount: { $sum: '$amount' } } }
    ])

    Promise.all([record, amount, months, selectedMonth])
      .then(([record, amount, months, selectedMonth]) => {
        const totalAmount = amount[0]
        res.render('index', { record, totalAmount, months, selectedMonth })
      })
      .catch(error => console.error(error))
  }
})

// create
router.get('/create', (req, res) => {
  res.render('create')
})

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('date').notEmpty().isISO8601().withMessage('date is required or the format is wrong'),
    body('category').notEmpty().withMessage('category is required'),
    body('amount').trim().notEmpty().isInt({ min: 1 }).withMessage('amount is required or you must enter more then 0')
  ],
  (req, res) => {
    const errors = validationResult(req)
    const record = req.body
    if (!errors.isEmpty()) {
      res.render('create', { errors: errors.mapped(), record })
    } else {
      return Record.create(record)
        .then(() => {
          res.redirect('/')
        })
        .catch(error => console.log(error))
    }
  }
)

// update
router.get('/:id/edit', (req, res) => {
  const { id } = req.params
  // console.log(id)

  return Record.findById(id)
    .lean()
    .then(record => res.render('edit', { record }))
    .catch(error => console.log(error))
})

router.put('/:id/edit', (req, res) => {
  const { id } = req.params

  return Record.findById(id)
    .then(record => {
      record = Object.assign(record, req.body)
      return record.save()
    })
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

// delete
router.delete('/:id', (req, res) => {
  const { id } = req.params

  return Record.findById(id)
    .then(record => record.remove())
    .then(res.redirect('/'))
    .catch(error => console.log(error))
})

module.exports = router