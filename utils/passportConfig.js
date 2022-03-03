const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
// import model dari sequelize
const { User } = require('../models')

function initializePassport(passport) {
  // fungsi untuk mendefinisikan cara login
  const authenticateUser = (email, password, done) => {
    // cari email yang di input di halaman front end di database user
    User.findOne({
      where: {
        email: email
      }
    }).then((userData) => {

      // cek apakah findone nya nemu user yang sesuai dengan email
      // kalau gak ada yang sama userData = null
      if (userData) {
        // proses pencocokan password yang di input user dengan password yang di database
        bcrypt.compare(password, userData.password, (err, isMatch) => {
          // nilai ismatch akan true kalau password dan password yang di db nilainya sama
          if (isMatch) {
            // panggil done tiap berhasil atau gagal login
            // parameter pertama done adalah untuk error
            return done(null, userData)
          } else {
            // jika passwordnya salah
            return done(null, false, { message: "Password Is Incorrect" })
          }
        })
      } else {
        // jika user dengan email yang dicari tidak ditemukan di db user
        return done(null, false, { message: "Email Not Registered" })
      }
    }).catch((error) => {
      return done(error)
    })
  }

  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      authenticateUser
    )
  )
  // digunakan untuk menyimpan user yang login di dalam session
  passport.serializeUser((user, done) => done(null, user.uuid))
  // digunakan untuk menghapus sesi login user / logout
  passport.deserializeUser(async (id, done) => {
    // dari id user yang mau logout
    const userDeserialize = await User.findOne({
      where: {
        uuid: id
      }
    })
    return done(null, userDeserialize)
  })
}

module.exports = initializePassport