const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const db = require('./myApp')
const bodyParser = require('body-parser')
const moment = require('moment')
app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})
app.post('/api/exercise/new-user', (req, res) => {
  const { username } = req.body
  db.createAndSaveUser(username, (err, data) => {
    if (err) {
      res.json(err.errors.username.message)
    } else {
      const { username, _id } = data
      res.json({ username, _id })
    }
  })
})
app.post('/api/exercise/add', (req, res) => {
  let { userId, description, duration, date } = req.body
  date = moment(date ? new Date(date) : new Date()).format('ddd MMM DD YYYY')
  duration = parseInt(duration)

  if (!duration) {
    res.json('Duration must be a number expressing minutes')
  } else if (date === 'Invalid date') {
    res.json('Invalid Date')
  } else {
    db.addExercise(userId, description, duration, date, (err, data) => {
      if (err) res.send('No Such UserId exist. Please enter a valid User Id')
      else {
        console.log(data)
        const { _id, username } = data
        res.json({ _id, username, date, duration, description })
      }
    })
  }
})

app.get('/api/exercise/users', (req, res) => {
  db.getAllUsers((err, data) => {
    if (err) {
      res.json(err)
    }
    res.json(data)
  })
})
app.get('/api/exercise/log', (req, res) => {
  const { userId, from, to, limit } = req.query

  db.getUser(userId, from, to, limit, (err, data) => {
    if (err) {
      res.json(err)
    }
    const { _id, username, log } = data
    res.json({ _id, username, count: log.length, log })
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
// 6075dee97589ca26dc7b03f5
