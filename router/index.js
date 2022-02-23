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

// middleware multer untuk upload file
const uploadImage = require('../utils/uploadImage')

// ini route untuk ke home page
router.get('/', Home)
// route untuk render halaman create book
router.get('/create', CreateBook)
// untuk post data ke database
// untuk upload satu file
// router.post('/create', uploadImage.single('image'), CreateBookFunction)
router.post('/create', uploadImage.array('image', 3), CreateBookFunction)
// untuk render halaman detail buku
router.get('/detail/:id', Singlebook)
// untuk render halaman edit buku
router.get('/edit/:id', EditBook)
// untuk edit buku
router.post('/edit/:id', uploadImage.array('image', 3), EditBookFunction)
// untuk delete buku
router.post('/delete/:id', DeleteBookFunction)


module.exports = router