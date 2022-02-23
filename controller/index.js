const { Book } = require('../models')


// controller untuk halaman home page
const Home = async (req, res) => {
  const daftarBuku = await Book.findAll()
  res.render('home', {
    data: daftarBuku
  })
}

// untuk render halaman create buku baru
const CreateBook = (req, res) => {
  res.render('createBook')
}

// untuk create new book
const CreateBookFunction = async (req, res,) => {
  const { author_name, title, description, release_date } = req.body
  // penulisan menggunakan then
  Book.create({
    author_name,
    title,
    description,
    release_date
  }).then((data) => {
    res.redirect('/')
  }).catch((error) => {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.redirect('/')
  })

  // cara kedua pakai async await
  // try {
  //   const newBook = await Book.create({
  //     author_name,
  //     title,
  //     description,
  //     release_date
  //   })

  //   if (newBook) {
  //     res.redirect('/')
  //   }
  // } catch (error) {
  //   console.log('====================================');
  //   console.log(error);
  //   console.log('====================================');
  //   res.redirect('/')
  // }
}

// untuk render halaman detail buku
const Singlebook = async (req, res) => {

  const singleBook = await Book.findOne({
    where: {
      uuid: req.params.id
    }
  })


  res.render('singleBook', {
    data: singleBook
  })
}

// untuk render halaman edit buku
const EditBook = async (req, res) => {

  const singleBook = await Book.findOne({
    where: {
      uuid: req.params.id
    }
  })


  res.render('editBook', {
    data: singleBook
  })
}


// untuk Edit book
const EditBookFunction = async (req, res,) => {
  const { author_name, title, description, release_date } = req.body

  try {
    const bookToUpdate = await Book.findOne({
      where: {
        uuid: req.params.id
      }
    })
    const bookUpdated = await bookToUpdate.update({
      author_name,
      title,
      description,
      release_date
    })

    if (bookUpdated) {
      res.redirect('/')
    }
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.redirect('/')
  }
}

// untuk Delete book
const DeleteBookFunction = async (req, res,) => {
  try {
    const bookToDelete = await Book.destroy({
      where: {
        uuid: req.params.id
      }
    })

    if (bookToDelete) {
      res.redirect('/')
    }
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.redirect('/')
  }
}



module.exports = {
  Home,
  CreateBook,
  CreateBookFunction,
  Singlebook,
  EditBook,
  EditBookFunction,
  DeleteBookFunction
}