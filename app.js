const express = require('express')
const morgan = require('morgan')
const { google } = require('googleapis')
const fs = require('fs')
const { getSheets } = require('./src/googlesheets-auth')
const request = require('request')

const app = express()
app.use(morgan())
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')

app.get('/test', (req, res) => {
  getSheets({
    range: 'A1:C',
    spreadsheetId: '1k6X8_BHi4EcytD5Am0RvWdx55Bmi4w2SMXOAQqVURZk',
    onSheetFetched: (error, response) => {
      if (error) return res.send('Error')

      const { values } = response.data
      const cells = values.slice(0, 1)[0]
      const rows = values.slice(1)
      res.render('test', { rows, cells })
    }
  })
})

const PORT = 5090
app.listen(PORT, () => {
  console.log(`Listen on ${PORT} port😜`)
})