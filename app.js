const express = require('express')
const exphbs = require('express-handlebars')
const expressbodyParser = require('body-parser')
const methodOverride = require('method-override')
const routes = require('./routes')
require('./config/mongoose')

const app = express()
const PORT = process.env.PORT || 3000

app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main',
    helpers: {
      toMoney: number => (number === undefined ? 0 : number.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ',')),
      ifEquals: (select, selectValue) => (select === selectValue ? 'selected' : ''),
      getFormatDate: date => date.toISOString().substring(0, 10)
    }
  })
)

app.set('view engine', 'handlebars')

app.use(express.static('public'))
app.use(expressbodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(routes)

/* Start and Listen on the server */
app.listen(PORT, () => {
  console.log(`Express is listening on localhost:${PORT}`)
})