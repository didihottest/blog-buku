const express = require('express')
const router = express.Router()
const {
  Home,
  CreateBook,
  CreateBookFunction,
  Singlebook,
  EditBook,
  EditBookFunction,
  DeleteBookFunction,
  Register,
  RegisterFunction,
  Login,
  Logout
} = require('../controller')

// import passport untuk fungsi login 
const passport = require('passport')

// middleware untuk check login
const {
  checkNotAuthenticated,
  // untuk memperbolehkan hanya user yang login bisa akses routenya
  checkAuthenticated
} = require('../middleware/authenticate')

// middleware multer untuk upload file
const uploadImage = require('../utils/uploadImage')

// ini route untuk ke home page
router.get('/', Home)
// route untuk render halaman create book
router.get('/create', checkAuthenticated, CreateBook)
// untuk post data ke database
// untuk upload satu file
// router.post('/create', uploadImage.single('image'), CreateBookFunction)
router.post('/create', uploadImage.array('image', 3), checkAuthenticated, CreateBookFunction)
// untuk render halaman detail buku
router.get('/detail/:id', Singlebook)
// untuk render halaman edit buku
router.get('/edit/:id', checkAuthenticated, EditBook)
// untuk edit buku
router.post('/edit/:id', checkAuthenticated, uploadImage.array('image', 3), EditBookFunction)
// untuk delete buku
router.post('/delete/:id', checkAuthenticated, DeleteBookFunction)
// untuk render halaman register
router.get('/register', checkNotAuthenticated, Register)
// fungsi untuk login
router.post('/register', checkNotAuthenticated, RegisterFunction)
// render halaman login
router.get('/login', checkNotAuthenticated, Login)
// untuk fungsi login
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  // kalau berhasil arahkan ke root url
  successRedirect: '/',
  // kalau gagal arahkan ke halaman login
  failureRedirect: '/login',
  failureFlash: true
}))
router.get('/logout', Logout)


module.exports = router