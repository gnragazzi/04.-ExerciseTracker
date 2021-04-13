require('dotenv').config()
const { parse } = require('dotenv')
const mongoose = require('mongoose')
const { Schema } = mongoose
const moment = require('moment')

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log(`we're connected`)
})
const userSchema = new Schema({
  username: { type: String, required: true },
  _id: mongoose.ObjectId,
  log: [],
})

let ExerciseUser = mongoose.model('ExeciseUser', userSchema)

const createAndSaveUser = (username, done) => {
  const newUser = new ExerciseUser({
    username: username,
    _id: new mongoose.Types.ObjectId(),
  })
  newUser.save((err, data) => {
    if (err) done(err, data)
    done(null, data)
  })
}

const addExercise = (userId, description, duration, date, done) => {
  const newExercise = {
    description,
    duration,
    date,
  }
  ExerciseUser.findById(userId, (err, data) => {
    if (err) done(err, data)
    data.log.push(newExercise)
    data.save((err, data) => {
      if (err) done(err, data)
      done(null, data)
    })
  })
}

const getAllUsers = (done) => {
  ExerciseUser.find({})
    .select({ username: 1, _id: 1 })
    .exec((err, data) => {
      if (err) return console.error(err)
      done(null, data)
    })
}
const getUser = (userId, from, to, limit, done) => {
  const query = ExerciseUser.findById(userId)
  query.exec((err, data) => {
    if (err) return console.error(err)
    if (from) {
      if (new Date(from) === 'Invalid Date') {
        console.log('ERROR')
        done("Invalid 'from' Date", data)
      } else {
        const parsedFrom = new Date(from).getTime()
        data.log = data.log.filter((item) => {
          const { date } = item
          let parsedDate = new Date(moment(date).format('YYYY-MM-DD')).getTime()
          if (parsedDate > parsedFrom) return item
        })
      }
    }
    if (to) {
      if (new Date(to) === 'Invalid Date') {
        done("Invalid 'to' Date", data)
      }
      const parsedTo = new Date(to).getTime()
      data.log = data.log.filter((item) => {
        const { date } = item
        let parsedDate = new Date(moment(date).format('YYYY-MM-DD')).getTime()
        if (parsedDate < parsedTo) return item
      })
    }
    if (limit) {
      data.log = data.log.filter((item, index) => {
        if (index < parseInt(limit)) return item
      })
    }
    done(null, data)
  })
}

exports.createAndSaveUser = createAndSaveUser
exports.addExercise = addExercise
exports.getAllUsers = getAllUsers
exports.getUser = getUser
