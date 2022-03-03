require('dotenv').config()

const express = require('express')
const app = express()
const db = require('./models')
const router = require('./router')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const initializePassport = require('./utils/passportConfig')

// sequelize session untuk simpan sesi login dan lain2 di database
const SessionStore = require('express-session-sequelize')(session.Store);
const sequelizeSessionStore = new SessionStore({
  db: db.sequelize,
});

// inisialiasi passport js agar bisa digunakan
initializePassport(passport)



app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + "/public"))
// setup session untuk passing cookies yang digunakan untuk flash
// passport juga membutuhkan session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  // untuk simpan session ke database
  store: sequelizeSessionStore,
}))
// middleware initialize passport
app.use(passport.initialize())
app.use(passport.session())

// flash digunakan untuk menampilkan alert notifikasi
app.use(flash());

app.set('view engine', 'ejs')
app.set('views', './views')


app.use(router)
// middleware untuk handle 404 not found baik dari halaman walaupun data
app.use((req, res, next) => {
  res.status(404).render('error', {
    title: "404 Not Found"
  })
})


const PORT = process.env.PORT || 5000

db.sequelize.sync({
  // force: true
}).then(() => {
  console.log("Database Connected");
  app.listen(PORT, () => {
    console.log('====================================');
    console.log(`Server is Running at port ${PORT}`);
    console.log('====================================');
  })
}).catch((error) => {
  console.log(error);
})

