const express = require('express')
const router = express.Router()
const {
  Home,
  CreateBook,
  CreateBookFunction,
  Singlebook,
  EditBook,
  EditBookFunction,
  DeleteBookFunction
} = require('../controller')
// ini route untuk ke home page
router.get('/', Home)
// route untuk render halaman create book
router.get('/create', CreateBook)
// untuk post data ke database
router.post('/create', CreateBookFunction)
// untuk render halaman detail buku
router.get('/detail/:id', Singlebook)
// untuk render halaman edit buku
router.get('/edit/:id', EditBook)
// untuk edit buku
router.post('/edit/:id', EditBookFunction)
// untuk delete buku
router.post('/delete/:id', DeleteBookFunction)


module.exports = router